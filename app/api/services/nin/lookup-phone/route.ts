import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';
import { Decimal } from '@prisma/client/runtime/library';

// API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const PHONE_VERIFY_ENDPOINT = 'https://raudah.com.ng/api/nin/phone2';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

// Helper function to parse API errors
function parseApiError(error: any): string {
  if (error.code === 'ECONNABORTED') {
    return 'The verification service timed out. Please try again.';
  }
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.message && data.response_code === "01") {
      return `Sorry 😢 ${data.message}`;
    }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
  }
  if (error.message) {
    return error.message;
  }
  return 'An internal server error occurred.';
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { phone } = body; 

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // --- 1. Call External API (Raudah) ---
    console.log(`[DEBUG] Calling Raudah NIN Phone2 with value: ${phone}`);
    
    let data: any;
    try {
      const response = await axios.post(PHONE_VERIFY_ENDPOINT, 
        { 
          value: phone,
          ref: `XPRESSPOINT_PHN_${user.id}_${Date.now()}`
        },
        {
          headers: { 
            'Authorization': RAUDAH_API_KEY,
            'Content-Type': 'application/json' 
          },
          timeout: 15000,
        }
      );
      data = response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.log("Raudah Phone API (Debug): Received error status, logging payload...");
        data = error.response.data; // This is what we want to log
      } else {
        throw error; // A real network error
      }
    }

    // --- 2. THIS IS THE "WORLD-CLASS" DEBUGGING STEP ---
    // We will log the *complete* response and stop.
    // The charging code is disabled.
    console.log("--- FULL RAUDAH NIN PHONE2 RESPONSE ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("--- END OF RESPONSE ---");
    
    // --- 3. CHARGING IS TEMPORARILY DISABLED ---
    // We are commenting out the database transaction
    /*
    const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
    const price = service.agentPrice;
    await prisma.$transaction([
      prisma.wallet.update(...),
      prisma.ninVerification.create(...),
      prisma.transaction.create(...)
    ]);
    */

    return NextResponse.json(
      { error: "DEBUG: Check the server logs for the full response." },
      { status: 400 }
    );

  } catch (error: any) {
    const errorMessage = parseApiError(error);
    console.error(`NIN Lookup (Phone) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
