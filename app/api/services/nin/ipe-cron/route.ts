import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Get API credentials
const RAUDAH_API_KEY = process.env.RAUDAH_API_KEY;
const STATUS_ENDPOINT = 'https://raudah.com.ng/api/nin/ipe-status';
const CRON_SECRET = process.env.CRON_JOB_SECRET;
const REFUND_CODES = ["404", "405", "406", "407", "409"];

export async function POST(request: Request) {
  // --- 1. "World-Class" Security ---
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!RAUDAH_API_KEY) {
    console.error("CRON JOB: RAUDAH_API_KEY is not set.");
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  let updated = 0;
  let failed = 0;

  try {
    // --- 2. Get all PROCESSING requests ---
    const processingRequests = await prisma.ipeRequest.findMany({
      where: { status: 'PROCESSING' },
    });

    if (processingRequests.length === 0) {
      return NextResponse.json({ message: 'No processing jobs to check.' });
    }

    console.log(`CRON JOB: Found ${processingRequests.length} processing IPE requests.`);

    // --- 3. Loop and check each one ---
    for (const request of processingRequests) {
      try {
        const response = await axios.post(STATUS_ENDPOINT, 
          { value: request.trackingId },
          {
            headers: { 
              'Authorization': RAUDAH_API_KEY,
              'Content-Type': 'application/json' 
            },
            timeout: 10000,
          }
        );
        
        const data = response.data;

        if (data.response_code === "00" && data.verificationStatus === "NIN-IPE CLEARED SUCCESSFUL!") {
          // --- SUCCESS! ---
          await prisma.ipeRequest.update({
            where: { id: request.id },
            data: {
              status: 'COMPLETED',
              statusMessage: 'IPE Cleared successfully',
              newTrackingId: data.newTracking_id,
            },
          });
          updated++;
        } else if (data.response_code === "03" || REFUND_CODES.includes(data.response_code)) {
          // --- FAILED! ---
          await prisma.ipeRequest.update({
            where: { id: request.id },
            data: {
              status: 'FAILED',
              statusMessage: data.message || 'Failed at provider.',
            },
          });
          failed++;
        }
        // If "02" (In-Progress), we do nothing.

      } catch (loopError: any) {
        console.error(`CRON JOB: Failed to check ${request.trackingId}:`, loopError.message);
      }
    }

    const message = `IPE Cron job complete. Checked: ${processingRequests.length}, Updated: ${updated}, Failed: ${failed}.`;
    console.log(message);
    return NextResponse.json({ message });

  } catch (error: any) {
    console.error('CRON JOB: Unhandled error:', error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
