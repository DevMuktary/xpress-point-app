import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';
import { processCommission } from '@/lib/commission'; // <--- THE FIX

// Get API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const SUBMIT_ENDPOINT = 'https://raudah.com.ng/api/nin/ipe-clearance';
const REFUND_CODES = ["404", "405", "406", "407", "409"]; 

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
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

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // --- 1. Get Service & Price (Standardized) ---
    // Hardcoded ID for IPE Clearance
    const serviceId = 'NIN_IPE_CLEARANCE';
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // PRICE FIX: Use Default Agent Price for everyone
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
      return NextResponse.json({ error: 'You already have a pending or processing request for this Tracking ID.' }, { status: 409 });
    }

    // --- 3. Call External API (Raudah) ---
    // We call API *before* charging (as per your specific IPE flow)
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
    
    // --- 4. Auto-Refund Logic ---
    if (data.response_code && REFUND_CODES.includes(data.response_code)) {
      console.log(`IPE Auto-Refund: ${data.message}`);
      return NextResponse.json({ error: `Sorry 😞 ${data.message}` }, { status: 400 });
    }
    
    // --- 5. Handle Success ---
    const isSuccess1 = (data.response_code === "00" && data.transactionStatus === "SUCCESSFUL");
    const isSuccess2 = (data.status === "Successful" && data.reply);

    if (isSuccess1 || isSuccess2) {
      const priceAsString = price.toString();

      // --- EXECUTE TRANSACTION ---
      await prisma.$transaction(async (tx) => {
        // a) Charge User
        await tx.wallet.update({
          where: { userId: user.id },
          data: { balance: { decrement: priceAsString } },
        });

        // b) PROCESS COMMISSION (The Definite Fix)
        // This calculates and credits the aggregator instantly
        await processCommission(tx, user.id, service.id);

        // c) Create IPE Request
        await tx.ipeRequest.create({
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
            amount: price.negated(),
            description: `IPE Clearance (${trackingId})`,
            reference: data.transactionReference || data.reply || `IPE-${Date.now()}`,
            status: 'COMPLETED',
          },
        });
      });

      return NextResponse.json(
        { message: data.message || 'Request submitted successfully! You can check the status shortly.' },
        { status: 200 }
      );
      
    } else {
      // --- Failure ---
      throw new Error(data.message || data.description || "Submission failed. Please check the Tracking ID.");
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
