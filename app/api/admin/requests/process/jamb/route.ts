import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { processCommission } from '@/lib/commission';
import { sendStatusNotification } from '@/lib/whatsapp'; // <--- Import

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action, refund, note, resultUrl, profileCodeResult } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request & include User to get phone number
    const jambRequest = await prisma.jambRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // <--- Ensure user is included
    });

    if (!jambRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.jambRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        await tx.jambRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Service Completed Successfully',
            uploadedSlipUrl: resultUrl || null,        // For PDF Slips
            profileCodeResult: profileCodeResult || null // For Text Codes
          }
        });

        // --- PAY COMMISSION ---
        await processCommission(tx, jambRequest.userId, jambRequest.serviceId);
      } 
      
      else if (action === 'FAILED') {
        await tx.jambRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            statusMessage: note || 'Service Failed'
          }
        });

        // --- Refund Logic ---
        if (refund) {
          const transaction = await tx.transaction.findFirst({
            where: {
              userId: jambRequest.userId,
              serviceId: jambRequest.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: jambRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: jambRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: JAMB Service Failed`,
                reference: `REF-${Date.now()}`,
                status: 'COMPLETED'
              }
            });
          }
        }
      }
    });

    // --- SEND WHATSAPP NOTIFICATION (After DB Transaction) ---
    if (jambRequest?.user?.phoneNumber) {
        let statusText = action;
        // Customize success message based on type (Code or Slip)
        if (action === 'COMPLETED') {
            if (profileCodeResult) statusText = 'COMPLETED (Profile Code Ready)';
            else statusText = 'COMPLETED (Slip Ready)';
        }
        if (action === 'FAILED') statusText = 'FAILED (Please check dashboard)';
        
        await sendStatusNotification(
            jambRequest.user.phoneNumber, 
            "JAMB Service", 
            statusText
        );
    }
    // ---------------------------------------------------------

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process JAMB Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
