import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials
const CONFIRMIDENT_API_KEY = process.env.CONFIRMIDENT_API_KEY;
const PHONE_VERIFY_ENDPOINT = 'https://confirmident.com.ng/api/nin_phone';

if (!CONFIRMIDENT_API_KEY) {
  console.error("CRITICAL: CONFIRMIDENT_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!CONFIRMIDENT_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { phone } = body; 

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // --- 1. Call External API (ConfirmIdent) ---
    console.log(`[DEBUG] Calling ConfirmIdent NIN Phone with value: ${phone}`);
    
    let data: any;
    try {
      const response = await axios.post(PHONE_VERIFY_ENDPOINT, 
        { 
          phone: phone
        },
        {
          headers: { 
            'api-key': CONFIRMIDENT_API_KEY,
            'Content-Type': 'application/json' 
          },
          timeout: 15000,
        }
      );
      data = response.data;
    } catch (error: any) {
      // This will catch and log any API call failures
      console.error(`NIN Lookup (Phone) Error:`, error.message);
      if (error.response && error.response.data) {
        console.error("--- CONFIRMIDENT ERROR RESPONSE ---");
        console.log(JSON.stringify(error.response.data, null, 2));
        console.error("--- END OF ERROR RESPONSE ---");
      }
      return NextResponse.json(
        { error: error.message || 'An internal server error occurred.' },
        { status: 500 }
      );
    }
    
    // --- 2. THIS IS THE "WORLD-CLASS" DEBUGGING STEP ---
    // We will log the *complete* successful response and stop.
    // All charging code is disabled.
    console.log("--- FULL CONFIRMIDENT PHONE RESPONSE ---");
    console.log(JSON.stringify(data, null, 2));
    console.log("--- END OF RESPONSE ---");
    // -------------------------------------------------

    return NextResponse.json(
      { error: "DEBUG: Check the server logs for the full response." },
      { status: 400 }
    );

  } catch (error: any) {
    console.error(`NIN Lookup (Phone) Unhandled Error:`, error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
