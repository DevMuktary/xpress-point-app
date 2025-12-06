import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// --- CONFIGURATION ---
const API_KEY = process.env.ROBOSTTECH_API_KEY;
const CHECK_ENDPOINT = 'https://robosttech.com/api/clearance_status';

export async function GET(request: Request) {
  // Simple security check (optional, or use a cron secret)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  if (!API_KEY) {
    console.error("CRITICAL: ROBOSTTECH_API_KEY is not set for Cron.");
    return NextResponse.json({ error: 'Config error' }, { status: 500 });
  }

  try {
    // 1. Fetch PROCESSING requests
    const pendingRequests = await prisma.ipeRequest.findMany({
      where: { status: 'PROCESSING' },
      take: 20, // Process in batches
      orderBy: { updatedAt: 'asc' } // Oldest first
    });

    if (pendingRequests.length === 0) {
      return NextResponse.json({ message: 'No pending requests.' });
    }

    const results = [];

    // 2. Iterate and Check
    for (const req of pendingRequests) {
      try {
        const response = await axios.post(CHECK_ENDPOINT, 
          { tracking_id: req.trackingId },
          {
            headers: { 
              'api-key': API_KEY,
              'Content-Type': 'application/json' 
            },
            timeout: 10000,
          }
        );

        const data = response.data;
        
        if (data.success === true) {
          // Success
          await prisma.ipeRequest.update({
            where: { id: req.id },
            data: {
              status: 'COMPLETED',
              statusMessage: data.message || 'Cleared successfully'
            }
          });
          results.push({ id: req.id, status: 'COMPLETED' });
        
        } else {
           // Check if failed or just pending
           const msg = data.message?.toLowerCase() || "";
           if (!msg.includes("pending") && !msg.includes("progress")) {
              // Mark as failed
              await prisma.ipeRequest.update({
                where: { id: req.id },
                data: {
                  status: 'FAILED',
                  statusMessage: data.message || 'Failed'
                }
              });
              results.push({ id: req.id, status: 'FAILED' });
           }
           // Else leave as PROCESSING
        }

      } catch (err: any) {
        console.error(`Cron Check Error for ${req.trackingId}:`, err.message);
        // Don't update status, try again next cron
      }
    }

    return NextResponse.json({ message: 'Cron job executed', processed: results.length, details: results });

  } catch (error: any) {
    console.error("IPE Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
