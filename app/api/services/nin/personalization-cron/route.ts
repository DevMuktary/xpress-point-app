import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// Get API credentials
const ROBOSTTECH_API_KEY = process.env.ROBOSTTECH_API_KEY;
const STATUS_ENDPOINT = 'https://robosttech.com/api/personalization_status';
const CRON_SECRET = process.env.CRON_JOB_SECRET;

export async function POST(request: Request) {
  // --- 1. "World-Class" Security ---
  // Check for the secret key in the authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!ROBOSTTECH_API_KEY) {
    console.error("CRON JOB: ROBOSTTECH_API_KEY is not set.");
    return NextResponse.json({ error: 'Service configuration error.' }, { status: 500 });
  }

  let updated = 0;
  let failed = 0;

  try {
    // --- 2. Get all PENDING requests ---
    const pendingRequests = await prisma.personalizationRequest.findMany({
      where: { status: 'PENDING' },
    });

    if (pendingRequests.length === 0) {
      return NextResponse.json({ message: 'No pending jobs to check.' });
    }

    console.log(`CRON JOB: Found ${pendingRequests.length} pending requests.`);

    // --- 3. Loop and check each one ---
    for (const request of pendingRequests) {
      try {
        const response = await axios.post(STATUS_ENDPOINT, 
          { tracking_id: request.trackingId },
          {
            headers: { 
              'api-key': ROBOSTTECH_API_KEY,
              'Content-Type': 'application/json' 
            },
            timeout: 10000, // Shorter timeout for cron
          }
        );
        
        const data = response.data;

        if (data.success === true && data.status === 'completed' && data.data) {
          // --- SUCCESS! ---
          await prisma.personalizationRequest.update({
            where: { id: request.id },
            data: {
              status: 'COMPLETED',
              statusMessage: 'Completed',
              data: data.data as any,
            },
          });
          updated++;
        } else if (data.success === false || data.status === 'failed') {
          // --- FAILED! ---
          await prisma.personalizationRequest.update({
            where: { id: request.id },
            data: {
              status: 'FAILED',
              statusMessage: data.message || 'Failed at provider.',
            },
          });
          failed++;
        }
        // If still pending, we do nothing and let it loop.

      } catch (loopError: any) {
        console.error(`CRON JOB: Failed to check ${request.trackingId}:`, loopError.message);
      }
    }

    const message = `Cron job complete. Checked: ${pendingRequests.length}, Updated: ${updated}, Failed: ${failed}.`;
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
