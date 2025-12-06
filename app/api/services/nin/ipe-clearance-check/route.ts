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

    if (existingRequest.status === 'COMPLETED') {
      return NextResponse.json({ status: 'COMPLETED', message: 'This request is already complete.' });
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
    // We expect { success: true, ... } for a valid check
    // Logic: If 'success' is true, it might mean it's found/cleared.
    // If 'success' is false, it might mean pending or failed.
    
    if (data.success === true) {
      // --- SUCCESS / CLEARED ---
      // We assume success=true means the IPE is cleared or the check passed positive
      await prisma.ipeRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: data.message || 'IPE Cleared successfully',
          // newTrackingId: data.data?.new_tracking_id // Uncomment if Robost provides a new ID
        },
      });
      
      return NextResponse.json({ status: 'COMPLETED', message: 'Success! Your IPE Clearance is complete.' });

    } else {
      // --- NOT SUCCESSFUL YET (Failed or Pending) ---
      // We need to differentiate based on message if possible.
      // For now, if success is false, we treat it as processing or failed depending on message.
      
      const msg = data.message?.toLowerCase() || "";
      if (msg.includes("pending") || msg.includes("progress")) {
         return NextResponse.json({ status: 'PROCESSING', message: data.message || 'Still processing.' });
      } else {
         // Assume Failed if not pending
         await prisma.ipeRequest.update({
            where: { id: existingRequest.id },
            data: {
              status: 'FAILED',
              statusMessage: data.message || 'Clearance failed.',
            },
          });
          return NextResponse.json({ status: 'FAILED', message: `Request Failed: ${data.message}` });
      }
    }

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
    console.error(`IPE Clearance (Check) Error:`, errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
