import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { processCommission } from '@/lib/commission'; // Import the helper

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Security: Admin Only
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action, refund, note, retrievedBvn, resultUrl } = body; 
    // retrievedBvn: The text string (e.g., "22233344455")
    // resultUrl: The optional file upload

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request
    const bvnRequest = await prisma.bvnRequest.findUnique({
      where: { id: requestId },
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
          adminResultUrl: resultUrl // Optional file
        };

        await tx.bvnRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Retrieval Successful',
            retrievalResult: retrievedBvn, // Save the text BVN here
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
            statusMessage: note || 'Retrieval Failed'
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
                description: `Refund: BVN Retrieval Failed`,
                reference: `REF-${Date.now()}`,
                status: 'COMPLETED'
              }
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process BVN Retrieval Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
