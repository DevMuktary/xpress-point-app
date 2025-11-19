import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

const ROBOSTTECH_API_KEY = process.env.ROBOSTTECH_API_KEY;
const STATUS_ENDPOINT = 'https://robosttech.com/api/personalization_status';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // 1. Find the request in our database
    const existingRequest = await prisma.personalizationRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    // If already completed, just return success (don't waste API call)
    if (existingRequest.status === 'COMPLETED') {
      return NextResponse.json({ 
        status: 'COMPLETED', 
        message: 'This request is already complete.',
        updatedRequest: existingRequest 
      });
    }

    // 2. Call Robosttech Status API
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
    
    // 3. Handle Response based on your provided documentation
    if (data.success === true && data.status === 'completed' && data.data) {
      // --- SUCCESS! ---
      const updatedRequest = await prisma.personalizationRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: 'Completed',
          data: data.data as any, // Save the full data object
        },
      });
      
      return NextResponse.json({ 
        status: 'COMPLETED', 
        message: 'Success! Your data is ready.',
        updatedRequest 
      });

    } else if (data.success === false && data.status === 'failed') {
      // --- FAILED! ---
      const updatedRequest = await prisma.personalizationRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'FAILED',
          statusMessage: data.message || 'The request failed at the provider.',
        },
      });
      return NextResponse.json({ 
        status: 'FAILED', 
        message: `Sorry 😞 ${data.message}`,
        updatedRequest
      });
    
    } else {
      // --- STILL PROCESSING ---
      return NextResponse.json({ 
        status: 'PROCESSING', 
        message: data.message || 'Request is still processing. Please check again later.',
        updatedRequest: existingRequest
      });
    }

  } catch (error: any) {
    console.error(`NIN Personalization (Check) Error:`, error.message);
    return NextResponse.json(
      { error: error.message || "An error occurred." },
      { status: 500 }
    );
  }
}
