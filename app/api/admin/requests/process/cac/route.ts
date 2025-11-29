import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { processCommission } from '@/lib/commission';
import { sendStatusNotification } from '@/lib/whatsapp'; // <--- Import

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Security: Admin Only
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action, refund, note, certificateUrl, statusReportUrl } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request & include User to get phone number
    const cacRequest = await prisma.cacRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // <--- Ensure user is included
    });

    if (!cacRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.cacRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        await tx.cacRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Service Completed Successfully',
            certificateUrl: certificateUrl || null,
            statusReportUrl: statusReportUrl || null
          }
        });

        // --- PAY COMMISSION ---
        await processCommission(tx, cacRequest.userId, cacRequest.serviceId);
      } 
      
      else if (action === 'FAILED') {
        await tx.cacRequest.update({
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
              userId: cacRequest.userId,
              serviceId: cacRequest.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: cacRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: cacRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: CAC Service Failed`,
                reference: `REF-${Date.now()}`,
                status: 'COMPLETED'
              }
            });
          }
        }
      }
    });

    // --- SEND WHATSAPP NOTIFICATION (After DB Transaction) ---
    if (cacRequest?.user?.phoneNumber) {
        let statusText = action;
        if (action === 'COMPLETED') statusText = 'COMPLETED (Successful)';
        if (action === 'FAILED') statusText = 'FAILED (Please check dashboard)';
        
        await sendStatusNotification(
            cacRequest.user.phoneNumber, 
            "CAC Service", 
            statusText
        );
    }
    // ---------------------------------------------------------

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process CAC Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
