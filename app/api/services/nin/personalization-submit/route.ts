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

    // 1. Get Price
    const service = await prisma.service.findUnique({ where: { id: 'NIN_PERSONALIZATION' } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found.' }, { status: 503 });
    }
    
    const rawPrice = user.role === 'AGGREGATOR' 
      ? service.platformPrice 
      : service.defaultAgentPrice;
    const price = new Decimal(rawPrice);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for this service.' }, { status: 402 });
    }

    // 2. Check Duplicates
    const existingRequest = await prisma.personalizationRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId }
    });
    if (existingRequest) {
      return NextResponse.json({ error: 'You have already submitted this Tracking ID.' }, { status: 409 });
    }

    // 3. Call Provider
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

    // 4. Database Transaction
    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();

    const newRequest = await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });
      const req = await tx.personalizationRequest.create({
        data: {
          userId: user.id,
          trackingId: trackingId,
          status: 'PROCESSING',
          statusMessage: 'Submitted. Awaiting completion.'
        },
      });
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
