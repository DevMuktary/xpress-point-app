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

    // We use a transaction to ensure DB consistency
    await prisma.$transaction(async (tx) => {
      
      let newStatus = 'PENDING'; // Default fallback
      let newStatusMessage = note;

      if (action === 'PROCESSING') {
        newStatus = 'PROCESSING';
        newStatusMessage = 'Processing... ' + (note || '');
      } else if (action === 'COMPLETED') { // <--- APPROVED maps to COMPLETED here
        newStatus = 'COMPLETED';
        newStatusMessage = note || 'Setup Successful. Check email for credentials.';
        
        // Save Agent Code if provided
        if (agentCode) {
           // We might want to save this to the User's profile or the Request
           // For now, let's assume we update the User's agentCode if it's empty
           if (!requestItem.user.agentCode) {
             await tx.user.update({
               where: { id: requestItem.userId },
               data: { agentCode: agentCode }
             });
           }
        }
      } else if (action === 'FAILED') { // <--- REJECTED maps to FAILED
        newStatus = 'FAILED';
        newStatusMessage = note || 'Setup Failed';
      }

      // 1. Update Request Status
      await tx.bvnRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus as any, // Cast to match Enum
          statusMessage: newStatusMessage
        }
      });

      // 2. Handle Commission (Only on Success)
      if (newStatus === 'COMPLETED') {
        await processCommission(tx, requestItem.userId, requestItem.serviceId);
      }

      // 3. Handle Refund (Only on Failure)
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

    // --- SEND WHATSAPP NOTIFICATION (Non-blocking) ---
    if (requestItem?.user?.phoneNumber) {
        let statusText = action;
        if (action === 'COMPLETED') statusText = 'COMPLETED (Successful)';
        if (action === 'FAILED') statusText = 'FAILED (Please check dashboard)';
        
        // We don't await this so it doesn't block the UI response
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
