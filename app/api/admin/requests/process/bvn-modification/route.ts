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
    const { requestId, action, refund, note, resultUrl } = body; 
    // action: 'PROCESSING' | 'COMPLETED' | 'FAILED'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request & include User to get phone number
    const bvnRequest = await prisma.bvnRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // <--- Ensure user is included
    });

    if (!bvnRequest) {
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
        // Save optional file to formData
        const currentFormData = bvnRequest.formData as any || {};
        const updatedFormData = {
          ...currentFormData,
          adminResultUrl: resultUrl // The file Admin uploads
        };

        await tx.bvnRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Modification Successful',
            formData: updatedFormData
          }
        });

        // --- PAY COMMISSION ---
        await processCommission(tx, bvnRequest.userId, bvnRequest.serviceId);
      } 
      
      else if (action === 'FAILED') {
        await tx.bvnRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            statusMessage: note || 'Modification Failed'
          }
        });

        // --- Refund Logic ---
        if (refund) {
          const transaction = await tx.transaction.findFirst({
            where: {
              userId: bvnRequest.userId,
              serviceId: bvnRequest.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: bvnRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: bvnRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: BVN Mod Failed`,
                reference: `REF-${Date.now()}`,
                status: 'COMPLETED'
              }
            });
          }
        }
      }
    });

    // --- SEND WHATSAPP NOTIFICATION (After DB Transaction) ---
    if (bvnRequest?.user?.phoneNumber) {
        let statusText = action;
        if (action === 'COMPLETED') statusText = 'COMPLETED (Successful)';
        if (action === 'FAILED') statusText = 'FAILED (Please check dashboard)';
        
        await sendStatusNotification(
            bvnRequest.user.phoneNumber, 
            "BVN Modification", 
            statusText
        );
    }
    // ---------------------------------------------------------

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process BVN Mod Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
