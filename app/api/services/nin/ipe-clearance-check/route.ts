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
    
    if (data.success === true) {
      // --- SUCCESS / CLEARED ---
      // Try to find the new ID in various likely fields from RobostTech
      const newId = data.new_tracking_id || data.data?.new_tracking_id || data.newTrackingId || null;

      await prisma.ipeRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: 'COMPLETED',
          statusMessage: data.message || 'IPE Cleared successfully',
          newTrackingId: newId, // <--- SAVING THE NEW ID
        },
      });
      
      // Return the new ID to the frontend immediately
      return NextResponse.json({ 
          status: 'COMPLETED', 
          message: 'Success! Your IPE Clearance is complete.', 
          newTrackingId: newId 
      });

    } else {
      // --- NOT SUCCESSFUL YET (Pending or Failed) ---
      const msg = (data.message || "").toLowerCase();
      
      // Keywords that definitely mean "Fail"
      const isFailed = msg.includes("fail") || msg.includes("error") || msg.includes("invalid") || msg.includes("not found") || msg.includes("decline") || msg.includes("rejected");

      if (isFailed) {
         await prisma.ipeRequest.update({
            where: { id: existingRequest.id },
            data: {
              status: 'FAILED',
              statusMessage: data.message || 'Clearance failed.',
            },
          });
          return NextResponse.json({ status: 'FAILED', message: `Request Failed: ${data.message}` });
      } else {
         // Default to PROCESSING for "pending" OR ambiguous messages
         // We do NOT update the DB status here, just return the status to frontend
         return NextResponse.json({ status: 'PROCESSING', message: data.message || 'Still processing.' });
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
