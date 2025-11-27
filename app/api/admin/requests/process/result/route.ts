import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { processCommission } from '@/lib/commission';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Security: Admin Only
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action, refund, note, resultUrl } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request
    const resultRequest = await prisma.resultRequest.findUnique({
      where: { id: requestId },
    });

    if (!resultRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.resultRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        // Save result file to formData
        const currentFormData = resultRequest.formData as any || {};
        const updatedFormData = {
          ...currentFormData,
          resultUrl: resultUrl // The Admin's uploaded result
        };

        await tx.resultRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Result Retrieval Successful',
            formData: updatedFormData,
            uploadedSlipUrl: resultUrl // Also update the main column if preferred for easy access
          }
        });

        // --- PAY COMMISSION ---
        await processCommission(tx, resultRequest.userId, resultRequest.serviceId);
      } 
      
      else if (action === 'FAILED') {
        await tx.resultRequest.update({
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
              userId: resultRequest.userId,
              serviceId: resultRequest.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: resultRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: resultRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: Result Check Failed`,
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
    console.error("Process Result Req Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
