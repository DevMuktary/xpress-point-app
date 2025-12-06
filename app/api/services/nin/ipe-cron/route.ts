import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

// --- CONFIGURATION ---
const API_KEY = process.env.ROBOSTTECH_API_KEY;
const CHECK_ENDPOINT = 'https://robosttech.com/api/clearance_status';

export async function GET(request: Request) {
  if (!API_KEY) {
    console.error("CRITICAL: ROBOSTTECH_API_KEY is not set for Cron.");
    return NextResponse.json({ error: 'Config error' }, { status: 500 });
  }

  try {
    // 1. Fetch PROCESSING requests
    const pendingRequests = await prisma.ipeRequest.findMany({
      where: { status: 'PROCESSING' },
      take: 20, 
      orderBy: { updatedAt: 'asc' } 
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
        
        // Check for success indicators
        if (data.success === true || data.status === 'success' || (data.reply && !data.error)) {
          // Success: Capture New ID (checking 'reply' first)
          const newId = 
            data.reply || 
            data.new_tracking_id || 
            data.data?.new_tracking_id || 
            data.newTrackingId || 
            null;

          await prisma.ipeRequest.update({
            where: { id: req.id },
            data: {
              status: 'COMPLETED',
              statusMessage: data.message || 'Cleared successfully',
              newTrackingId: newId
            }
          });
          results.push({ id: req.id, status: 'COMPLETED' });
        
        } else {
           // Check for strict failure
           const msg = (data.message || "").toLowerCase();
           
           // Only fail on explicit rejection words
           const isDefiniteFailure = 
             msg.includes("fail") || 
             msg.includes("error") || 
             msg.includes("invalid") || 
             msg.includes("decline") || 
             msg.includes("reject");

           if (isDefiniteFailure) {
              await prisma.ipeRequest.update({
                where: { id: req.id },
                data: {
                  status: 'FAILED',
                  statusMessage: data.message || 'Failed'
                }
              });
              results.push({ id: req.id, status: 'FAILED' });
           }
           // Else: Do nothing, leave as PROCESSING
        }

      } catch (err: any) {
        console.error(`Cron Check Error for ${req.trackingId}:`, err.message);
      }
    }

    return NextResponse.json({ message: 'Cron job executed', processed: results.length, details: results });

  } catch (error: any) {
    console.error("IPE Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
