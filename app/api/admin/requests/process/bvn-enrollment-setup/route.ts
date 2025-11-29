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
    const { requestId, action, refund, note } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request & include User to get phone number
    const requestItem = await prisma.bvnRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // <--- Ensure user is included
    });

    if (!requestItem) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.bvnRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        await tx.bvnRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Setup Successful. Check email for credentials.',
          }
        });

        // --- PAY COMMISSION ---
        await processCommission(tx, requestItem.userId, requestItem.serviceId);
      } 
      
      else if (action === 'FAILED') {
        await tx.bvnRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            statusMessage: note || 'Setup Failed'
          }
        });

        // --- Refund Logic ---
        if (refund) {
          const transaction = await tx.transaction.findFirst({
            where: {
              userId: requestItem.userId,
              serviceId: requestItem.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: requestItem.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: requestItem.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: BVN Enrollment Setup Failed`,
                reference: `REF-${Date.now()}`,
                status: 'COMPLETED'
              }
            });
          }
        }
      }
    });

    // --- SEND WHATSAPP NOTIFICATION (After DB Transaction) ---
    if (requestItem?.user?.phoneNumber) {
        let statusText = action;
        if (action === 'COMPLETED') statusText = 'COMPLETED (Successful)';
        if (action === 'FAILED') statusText = 'FAILED (Please check dashboard)';
        
        await sendStatusNotification(
            requestItem.user.phoneNumber, 
            "BVN Enrollment Setup", 
            statusText
        );
    }
    // ---------------------------------------------------------

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process Enrollment Setup Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
