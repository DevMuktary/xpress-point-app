import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// Get API credentials
const ROBOSTTECH_API_KEY = process.env.ROBOSTTECH_API_KEY;
const STATUS_ENDPOINT = 'https://robosttech.com/api/personalization_status';

if (!ROBOSTTECH_API_KEY) {
  console.error("CRITICAL: ROBOSTTECH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
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

    // --- 1. Find the request in our database ---
    const existingRequest = await prisma.personalizationRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    if (existingRequest.status === 'COMPLETED') {
      return NextResponse.json({ status: 'COMPLETED', message: 'This request is already complete.' });
    }

    // --- 2. Call External API (Robosttech) ---
    const response = await axios.post(STATUS_ENDPOINT, 
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
    
    // --- 3. Handle Robosttech Response ---
    
    if (data.success === true && data.status === 'completed' && data.data) {
      // --- SUCCESS! ---
      await prisma.personalizationRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: 'Completed',
          data: data.data as any,
        },
      });
      
      return NextResponse.json({ status: 'COMPLETED', message: 'Success! Your data is ready.' });

    } else if (data.success === false && data.status === 'failed') {
      // --- FAILED! ---
      await prisma.personalizationRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'FAILED',
          statusMessage: data.message || 'The request failed at the provider.',
        },
      });
      return NextResponse.json({ status: 'FAILED', message: `Sorry 😞 ${data.message}` });
    
    } else {
      // --- STILL PROCESSING ---
      // --- THIS IS THE FIX ---
      return NextResponse.json({ status: 'PROCESSING', message: data.message || 'Request is still processing.' });
    }

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
    console.error(`NIN Personalization (Check) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
