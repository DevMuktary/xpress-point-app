import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const NIN_VERIFY_ENDPOINT = 'https://raudah.com.ng/api/nin/v3';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin } = body; 

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    // --- THIS IS THE FIX ---
    // We are only calling the API and logging the result.
    // All charging and parsing logic is temporarily disabled.

    console.log(`[DEBUG] Calling Raudah NIN v3 with value: ${nin}`);

    const response = await axios.post(NIN_VERIFY_ENDPOINT, 
      { 
        value: nin,
        ref: `XPRESSPOINT_NIN_${user.id}_${Date.now()}`
      },
      {
        headers: { 
          'Authorization': RAUDAH_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    // --- THIS IS THE "WORLD-CLASS" DEBUGGING STEP ---
    console.log("--- FULL RAUDAH NIN v3 RESPONSE ---");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("--- END OF RESPONSE ---");
    // -------------------------------------------------

    // We will return a temporary error so the frontend stops loading.
    return NextResponse.json(
      { error: "DEBUG: Check the server logs for the full response." },
      { status: 400 }
    );

  } catch (error: any) {
    // This will catch and log any API call failures (like auth)
    console.error(`NIN Lookup (NIN) Error:`, error.message);
    if (error.response && error.response.data) {
      console.error("--- RAUDAH ERROR RESPONSE ---");
      console.log(JSON.stringify(error.response.data, null, 2));
      console.error("--- END OF ERROR RESPONSE ---");
    }
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
