import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { processCommission } from '@/lib/commission'; 

// --- CONFIGURATION ---
const API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_ENDPOINT = 'https://robosttech.com/api/clearance';

if (!API_KEY) {
  console.error("CRITICAL: ROBOSTTECH_API_KEY is not set.");
}

function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The service timed out. Please try again.';
  }
  if (error.response && error.response.data && (error.response.data.message || error.response.data.description)) {
    return error.response.data.message || error.response.data.description;
  }
  if (error.message) {
    return error.message;
  }
  return 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // --- 1. Get Service & Price ---
    const serviceId = 'NIN_IPE_CLEARANCE';
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    const price = new Decimal(service.defaultAgentPrice);

    // Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price}.` }, { status: 402 });
    }

    // --- 2. Check for Duplicates ---
    const existingRequest = await prisma.ipeRequest.findFirst({
      where: { 
        userId: user.id, 
        trackingId: trackingId,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });
    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending request for this Tracking ID.' }, { status: 409 });
    }

    // --- 3. Call RobostTech API ---
    console.log(`[ROBOST] Submitting IPE Clearance: ${trackingId}`);

    const response = await axios.post(SUBMIT_ENDPOINT, 
      { 
        tracking_id: trackingId 
      },
      {
        headers: { 
          'api-key': API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 30000,
      }
    );

    const data = response.data;
    console.log("ROBOST IPE SUBMIT RESPONSE:", JSON.stringify(data, null, 2));
    
    // --- 4. Handle Success ---
    // Robost usually returns { success: true, ... }
    if (data.success || response.status === 200) {
      const priceAsString = price.toString();

      await prisma.$transaction(async (tx) => {
        // a) Charge User
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: priceAsString } },
        });

        // b) Process Commission
        await processCommission(tx, user.id, service.id);

        // c) Create IPE Request
        await tx.ipeRequest.create({
          data: {
            userId: user.id,
            trackingId: trackingId,
            status: 'PROCESSING',
            statusMessage: data.message || 'Submitted. Awaiting clearance.'
          },
        });

        // d) Log Transaction
        await tx.transaction.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            type: 'SERVICE_CHARGE',
            amount: price.negated(),
            description: `IPE Clearance (${trackingId})`,
            reference: `IPE-${Date.now()}`,
            status: 'COMPLETED',
          },
        });
      });

      return NextResponse.json(
        { message: data.message || 'Request submitted successfully! Check back later for status.' },
        { status: 200 }
      );
      
    } else {
      throw new Error(data.message || "Submission failed at provider.");
    }

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`IPE Clearance (Submit) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
