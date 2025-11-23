import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

const ROBOSTTECH_API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_ENDPOINT = 'https://robosttech.com/api/personalization';

if (!ROBOSTTECH_API_KEY) {
  console.error("CRITICAL: ROBOSTTECH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!ROBOSTTECH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // --- 1. Get Service ---
    // Hardcoded ID based on your snippet
    const serviceId = 'NIN_PERSONALIZATION';
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 503 });
    }
    
    // --- 2. Set Price (Standardized) ---
    // Using defaultAgentPrice for everyone so commission can be extracted
    const price = new Decimal(service.defaultAgentPrice);
    
    // Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for this service.' }, { status: 402 });
    }

    // --- 3. Check Duplicates ---
    const existingRequest = await prisma.personalizationRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId }
    });
    if (existingRequest) {
      return NextResponse.json({ error: 'You have already submitted this Tracking ID.' }, { status: 409 });
    }

    // --- 4. Calculate Commission (New Logic) ---
    // We calculate this now, but only pay it if the API call succeeds later.
    let commissionAmount = new Decimal(0);
    let aggregatorWalletId = null;

    if (user.role === 'AGENT' && user.aggregatorId) {
      const aggregatorPrice = await prisma.aggregatorPrice.findUnique({
        where: {
          aggregatorId_serviceId: {
            aggregatorId: user.aggregatorId,
            serviceId: serviceId
          }
        }
      });

      if (aggregatorPrice) {
        commissionAmount = new Decimal(aggregatorPrice.commission);
        aggregatorWalletId = user.aggregatorId;
      }
    }

    // --- 5. Call Provider (Robosttech) ---
    // We call API *before* charging (Standard safety practice)
    const response = await axios.post(SUBMIT_ENDPOINT, 
      { tracking_id: trackingId },
      {
        headers: { 
          'api-key': ROBOSTTECH_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    if (data.success !== true) {
      throw new Error(data.message || "Submission failed. Please check the Tracking ID.");
    }

    // --- 6. Execute Transaction ---
    const priceAsString = price.toString();
    const commissionAsString = commissionAmount.toString();
    const negatedPriceAsString = price.negated().toString();

    const newRequest = await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Credit Aggregator (if applicable)
      if (aggregatorWalletId && commissionAmount.greaterThan(0)) {
        await tx.wallet.update({
          where: { userId: aggregatorWalletId },
          data: { commissionBalance: { increment: commissionAsString } }
        });
      }

      // c) Create Request
      const req = await tx.personalizationRequest.create({
        data: {
          userId: user.id,
          trackingId: trackingId,
          status: 'PROCESSING',
          statusMessage: 'Submitted. Awaiting completion.'
        },
      });

      // d) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: negatedPriceAsString,
          description: `NIN Personalization (${trackingId})`,
          reference: `NIN-PERS-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
      return req;
    });

    return NextResponse.json(
      { 
        message: 'Request submitted successfully! You can check the status shortly.',
        newRequest 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`NIN Personalization (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 400 }
    );
  }
}
