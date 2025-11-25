import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

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

    // 1. Get the request
    const modRequest = await prisma.modificationRequest.findUnique({
      where: { id: requestId },
    });

    if (!modRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.modificationRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        // Critical: Merge new resultUrl with existing formData
        const currentFormData = modRequest.formData as any || {};
        const updatedFormData = {
          ...currentFormData,
          resultUrl: resultUrl // This saves the file link you uploaded
        };

        await tx.modificationRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: note || 'Modification Successful',
            formData: updatedFormData
          }
        });
      } 
      
      else if (action === 'FAILED') {
        await tx.modificationRequest.update({
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
              userId: modRequest.userId,
              serviceId: modRequest.serviceId,
              type: 'SERVICE_CHARGE'
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            await tx.wallet.update({
              where: { userId: modRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            await tx.transaction.create({
              data: {
                userId: modRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: ${modRequest.serviceId} Failed`,
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
    console.error("Process NIN Mod Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
