import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// Get API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY; // We use the same key as BVN
const SUBMIT_ENDPOINT = 'https://raudah.com.ng/api/nin/ipe-clearance';
const REFUND_CODES = ["404", "405", "406", "407", "409"]; // Your "auto-refund" codes

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
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

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'NIN_IPE_CLEARANCE' } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for this service.' }, { status: 402 });
    }

    // --- 2. Check if this request already exists ---
    const existingRequest = await prisma.ipeRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId }
    });
    if (existingRequest) {
      return NextResponse.json({ error: 'You have already submitted this Tracking ID.' }, { status: 409 });
    }

    // --- 3. Call External API (Raudah) ---
    const response = await axios.post(SUBMIT_ENDPOINT, 
      { 
        value: trackingId,
        ref: `XPRESSPOINT_IPE_${user.id}_${Date.now()}`
      },
      {
        headers: { 
          'Authorization': RAUDAH_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    
    // --- 4. "World-Class" Auto-Refund Logic ---
    // Check for a failure/refund code *before* charging.
    if (data.response_code && REFUND_CODES.includes(data.response_code)) {
      console.log(`IPE Auto-Refund: ${data.message}`);
      return NextResponse.json({ error: `Sorry 😞 ${data.message}` }, { status: 400 });
    }
    
    // Check for other failures
    if (data.response_code !== "00" || data.transactionStatus !== "SUCCESSFUL") {
      throw new Error(data.message || "Submission failed. Please check the Tracking ID.");
    }

    // --- 5. Charge User & Save as PROCESSING ---
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      prisma.ipeRequest.create({
        data: {
          userId: user.id,
          trackingId: trackingId,
          status: 'PROCESSING',
          statusMessage: 'Submitted. Awaiting completion.'
        },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `IPE Clearance (${trackingId})`,
          reference: data.transactionReference || `IPE-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Request submitted successfully! You can check the status shortly.' },
      { status: 200 }
    );

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`IPE Clearance (Submit) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
