import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const PHONE_VERIFY_ENDPOINT = 'https://raudah.com.ng/api/nin/phone2';

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
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

    // --- THIS IS THE FIX ---
    // We are only calling the API and logging the result.
    
    console.log(`[DEBUG] Calling Raudah NIN Phone2 with value: ${phone}`);

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

    // --- THIS IS THE "WORLD-CLASS" DEBUGGING STEP ---
    console.log("--- FULL RAUDAH NIN PHONE2 RESPONSE ---");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("--- END OF RESPONSE ---");
    // -------------------------------------------------

    return NextResponse.json(
      { error: "DEBUG: Check the server logs for the full response." },
      { status: 400 }
    );

  } catch (error: any) {
    console.error(`NIN Lookup (Phone) Error:`, error.message);
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
