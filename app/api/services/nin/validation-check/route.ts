import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// Get API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const STATUS_ENDPOINT = 'https://raudah.com.ng/api/nin/instantvalidationstatus';
const REFUND_CODES = ["404", "405", "406", "407", "409"];

if (!RAUDAH_API_KEY) {
  console.error("CRITICAL: RAUDAH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { nin } = body; // The NIN to check

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    // --- 1. Find the request in our database ---
    const existingRequest = await prisma.validationRequest.findFirst({
      where: { userId: user.id, nin: nin, status: 'PROCESSING' }, // Only check PROCESSING ones
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'No processing request found for this NIN.' }, { status: 404 });
    }

    // --- 2. Call External API (Raudah) ---
    const response = await axios.post(STATUS_ENDPOINT, 
      { value: nin }, // As per docs, 'value' is the NIN
      {
        headers: { 
          'Authorization': RAUDAH_API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    
    // --- 3. Handle Raudah Response (Your "world-class" flow) ---
    
    if (data.response_code === "00" && data.verificationStatus === "NIN-IPE CLEARED SUCCESSFUL!") {
      // --- SUCCESS! ---
      await prisma.validationRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: 'Validation Cleared successfully',
          newTrackingId: data.newTracking_id, // <-- Save the new ID
        },
      });
      
      return NextResponse.json({ status: 'COMPLETED', message: 'Success! Your Validation is complete.' });

    } else if (data.response_code === "03" || REFUND_CODES.includes(data.response_code)) {
      // --- FAILED! (03 = Blocked, or 4xx = Error) ---
      await prisma.validationRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'FAILED',
          statusMessage: data.message || 'The request failed at the provider.',
        },
      });
      return NextResponse.json({ status: 'FAILED', message: `Sorry 😞 ${data.message}` });
    
    } else {
      // --- STILL PROCESSING ---
      // (response_code: "02", message: "Clearance In-Progress")
      return NextResponse.json({ status: 'PROCESSING', message: data.message || 'Request is still processing.' });
    }

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
    console.error(`NIN Validation (Check) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
