import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { processCommission } from '@/lib/commission';
import { sendStatusNotification } from '@/lib/whatsapp'; 

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action, refund, note, agentCode } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const requestItem = await prisma.bvnRequest.findUnique({
      where: { id: requestId },
      include: { user: true } 
    });

    if (!requestItem) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Run in a transaction
    await prisma.$transaction(async (tx) => {
      
      let newStatus = 'PENDING';
      let newStatusMessage = note;

      // --- DETERMINE NEW STATUS ---
      if (action === 'PROCESSING') {
        newStatus = 'PROCESSING';
        newStatusMessage = 'Processing... ' + (note || '');
      } 
      else if (action === 'COMPLETED' || action === 'APPROVED') { // Handle both
        newStatus = 'COMPLETED';
        newStatusMessage = note || 'Setup Successful. Check email for credentials.';
        
        // Save Agent Code if provided
        if (agentCode && !requestItem.user.agentCode) {
           await tx.user.update({
             where: { id: requestItem.userId },
             data: { agentCode: agentCode }
           });
        }
      } 
      else if (action === 'FAILED' || action === 'REJECTED') { // Handle both
        newStatus = 'FAILED';
        newStatusMessage = note || 'Setup Failed';
      }

      // --- 1. UPDATE REQUEST STATUS (CRITICAL) ---
      await tx.bvnRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus as any, 
          statusMessage: newStatusMessage
        }
      });

      // --- 2. HANDLE COMMISSION (SAFE MODE) ---
      // We wrap this in try/catch so commission errors DO NOT rollback the status update
      if (newStatus === 'COMPLETED') {
        try {
          await processCommission(tx, requestItem.userId, requestItem.serviceId);
        } catch (commError) {
          console.error("Commission Error (Non-blocking):", commError);
          // We intentionally do NOT throw error here, so the transaction succeeds
        }
      }

      // --- 3. HANDLE REFUND ---
      if (newStatus === 'FAILED' && refund) {
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
    });

    // --- SEND WHATSAPP NOTIFICATION ---
    if (requestItem?.user?.phoneNumber) {
        let statusText = action;
        if (action === 'COMPLETED' || action === 'APPROVED') statusText = 'COMPLETED (Successful)';
        if (action === 'FAILED' || action === 'REJECTED') statusText = 'FAILED (Please check dashboard)';
        
        sendStatusNotification(
            requestItem.user.phoneNumber, 
            "BVN Enrollment Setup", 
            statusText
        ).catch(e => console.error("WhatsApp Error:", e));
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process Enrollment Setup Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
