import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action, resultUrl, adminNote, shouldRefund, rejectionReason } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the request details (including service price for refund calculation)
    const reqItem = await prisma.modificationRequest.findUnique({
      where: { id: requestId },
      include: { service: true, user: true }
    });

    if (!reqItem) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      
      // --- 1. ACTION: START PROCESSING ---
      if (action === 'PROCESS') {
        await tx.modificationRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Your request is currently being processed by our team.'
          }
        });
      }

      // --- 2. ACTION: COMPLETE (Success) ---
      else if (action === 'COMPLETE') {
        if (!resultUrl) throw new Error("Result PDF is required for completion.");
        
        await tx.modificationRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: adminNote || 'Request completed successfully.',
            uploadedSlipUrl: resultUrl // Admin uploads this
          }
        });
      }

      // --- 3. ACTION: FAIL (Reject) ---
      else if (action === 'FAIL') {
        const message = rejectionReason || 'Request failed. Please contact support.';
        
        await tx.modificationRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            statusMessage: message
          }
        });

        // --- REFUND LOGIC ---
        if (shouldRefund) {
          // We assume the amount charged was the defaultAgentPrice + dynamic fees.
          // Ideally, we check the transaction history. For now, we refund the base service price
          // OR you can pass the exact amount if you tracked the dynamic fee separately.
          // Here, we look for the Transaction record linked to this service call to get exact amount.
          
          // Find the original transaction (negative amount)
          const originalTx = await tx.transaction.findFirst({
            where: {
              userId: reqItem.userId,
              serviceId: reqItem.serviceId,
              createdAt: { lte: reqItem.createdAt }, // Created around the same time
              amount: { lt: 0 } // Negative (Debit)
            },
            orderBy: { createdAt: 'desc' }
          });

          const refundAmount = originalTx ? originalTx.amount.abs() : reqItem.service.defaultAgentPrice;

          // Credit the Wallet
          await tx.wallet.update({
            where: { userId: reqItem.userId },
            data: { balance: { increment: refundAmount } }
          });

          // Log the Refund Transaction
          await tx.transaction.create({
            data: {
              userId: reqItem.userId,
              serviceId: reqItem.serviceId,
              type: 'REFUND',
              amount: refundAmount,
              description: `Refund for Failed NIN Mod (${reqItem.id.slice(0, 8)})`,
              reference: `REF-${Date.now()}`,
              status: 'COMPLETED'
            }
          });
        }
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Process Request Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
