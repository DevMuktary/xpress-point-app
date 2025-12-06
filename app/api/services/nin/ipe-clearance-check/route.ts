import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import axios from 'axios';

// --- CONFIGURATION ---
const API_KEY = process.env.ROBOSTTECH_API_KEY;
const CHECK_ENDPOINT = 'https://robosttech.com/api/clearance_status';

if (!API_KEY) {
  console.error("CRITICAL: ROBOSTTECH_API_KEY is not set.");
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { trackingId } = body;

    if (!trackingId) {
      return NextResponse.json({ error: 'Tracking ID is required.' }, { status: 400 });
    }

    // --- 1. Find Request ---
    const existingRequest = await prisma.ipeRequest.findFirst({
      where: { userId: user.id, trackingId: trackingId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    // --- 2. Call RobostTech API ---
    const response = await axios.post(CHECK_ENDPOINT, 
      { tracking_id: trackingId },
      {
        headers: { 
          'api-key': API_KEY,
          'Content-Type': 'application/json' 
        },
        timeout: 15000,
      }
    );

    const data = response.data;
    console.log("ROBOST IPE CHECK RESPONSE:", JSON.stringify(data, null, 2));
    
    // --- 3. Handle Response ---
    // API Documentation implies:
    // Success -> returns "reply" (new tracking ID) or similar fields
    // Failure -> returns explicit failure message
    
    // Check for success indicators
    if (data.success === true || data.status === 'success' || (data.reply && !data.error)) {
      
      // --- SUCCESS / CLEARED ---
      // We check 'reply' first as per your documentation note
      const newId = 
        data.reply || 
        data.new_tracking_id || 
        data.data?.new_tracking_id || 
        data.newTrackingId || 
        data.NewTrackingId ||
        null;

      await prisma.ipeRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: data.message || 'IPE Cleared successfully',
          newTrackingId: newId, // Saving the new ID found in 'reply'
        },
      });
      
      return NextResponse.json({ 
          status: 'COMPLETED', 
          message: 'Success! Your IPE Clearance is complete.', 
          newTrackingId: newId 
      });

    } else {
      // --- NOT COMPLETED YET ---
      const msg = (data.message || "").toLowerCase();
      
      // STRICT FAILURE CHECK:
      // Only mark as FAILED if it is definitely a permanent error (declined/rejected/invalid).
      // We explicitly EXCLUDE "not found" so it stays PROCESSING.
      const isDefiniteFailure = 
        msg.includes("fail") || 
        msg.includes("error") || 
        msg.includes("invalid") || 
        msg.includes("decline") || 
        msg.includes("reject");

      if (isDefiniteFailure) {
         await prisma.ipeRequest.update({
            where: { id: existingRequest.id },
            data: {
              status: 'FAILED',
              statusMessage: data.message || 'Clearance failed.',
            },
          });
          return NextResponse.json({ status: 'FAILED', message: `Request Failed: ${data.message}` });
      } else {
         // Default to PROCESSING for "pending", "not found" (in queue), or waiting
         return NextResponse.json({ status: 'PROCESSING', message: data.message || 'Still processing. Please check back later.' });
      }
    }

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
    console.error(`IPE Clearance (Check) Error:`, errorMessage);
    
    // If the API call itself fails (network error), we usually keep it as processing 
    // unless it's a 4xx error that implies invalid data.
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
