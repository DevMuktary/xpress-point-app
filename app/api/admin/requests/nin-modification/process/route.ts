import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

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

    // 1. Get the request & transaction info
    const modRequest = await prisma.modificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!modRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // 2. Find the transaction amount to refund (if needed)
    // We look for the transaction associated with this service execution
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId: modRequest.userId,
        serviceId: modRequest.serviceId,
        // We assume the most recent transaction for this service is the one (simplified)
        // Or you could link transactionId in the request model in the future.
        type: 'SERVICE_CHARGE'
      },
      orderBy: { createdAt: 'desc' }
    });

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
        // Update formData to include the result URL without losing previous data
        const currentFormData = modRequest.formData as any || {};
        const updatedFormData = {
          ...currentFormData,
          resultUrl: resultUrl // Store the Admin's PDF here
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
        if (refund && transaction) {
          // Convert the negative transaction amount back to positive for refund
          const refundAmount = transaction.amount.abs(); 
          
          // 1. Credit Wallet
          await tx.wallet.update({
            where: { userId: modRequest.userId },
            data: { balance: { increment: refundAmount } }
          });

          // 2. Log Refund Transaction
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
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process NIN Mod Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
