import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// Get API credentials
const ROBOSTTECH_API_KEY = process.env.ROBOSTTECH_API_KEY;
const SUBMIT_ENDPOINT = 'https://robosttech.com/api/personalization';

if (!ROBOSTTECH_API_KEY) {
  console.error("CRITICAL: ROBOSTTECH_API_KEY is not set.");
}

// Helper to parse errors
function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The service timed out. Please try again.';
  }
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
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

  if (!ROBOSTTECH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'NIN_PERSONALIZATION' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for this service.' }, { status: 402 });
    }

    // --- 2. Check if this request already exists ---
    const existingRequest = await prisma.personalizationRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId }
    });
    if (existingRequest) {
      return NextResponse.json({ error: 'You have already submitted this Tracking ID.' }, { status: 409 });
    }

    // --- 3. Call External API (Robosttech) ---
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
    
    // --- 4. Handle Robosttech Response ---
    if (data.success !== true) {
      // If the submission itself fails
      throw new Error(data.message || "Submission failed. Please check the Tracking ID.");
    }

    // --- 5. Charge User & Save as PENDING ---
    await prisma.$transaction([
      // a) Charge wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      // b) Create the new request
      prisma.personalizationRequest.create({
        data: {
          userId: user.id,
          trackingId: trackingId,
          status: 'PENDING',
          statusMessage: 'Submitted. Awaiting completion.'
        },
      }),
      // c) Log the transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `NIN Personalization (${trackingId})`,
          reference: `NIN-PERS-${Date.now()}`,
          status: 'COMPLETED', // The *charge* is completed
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Request submitted successfully! You can check the status shortly.' },
      { status: 200 }
    );

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`NIN Personalization (Submit) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
