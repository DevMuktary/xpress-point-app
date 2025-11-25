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
    const { requestId, action, refund, note, resultUrl } = body; 

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request
    const delinkRequest = await prisma.delinkRequest.findUnique({
      where: { id: requestId },
    });

    if (!delinkRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Hardcoded Service ID since Delink table doesn't store it
    const SERVICE_ID = 'NIN_DELINK';

    await prisma.$transaction(async (tx) => {
      
      if (action === 'PROCESSING') {
        await tx.delinkRequest.update({
          where: { id: requestId },
          data: {
            status: 'PROCESSING',
            statusMessage: 'Processing... ' + (note || '')
          }
        });
      } 
      
      else if (action === 'COMPLETED') {
        // Since Delink table has no formData/resultUrl column, we append the link to the message
        let finalMessage = note || 'Delink Successful.';
        if (resultUrl) {
          finalMessage += ` View Proof: ${resultUrl}`;
        }

        await tx.delinkRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            statusMessage: finalMessage
          }
        });

        // --- PAY COMMISSION (The Definite Fix) ---
        await processCommission(tx, delinkRequest.userId, SERVICE_ID);
      } 
      
      else if (action === 'FAILED') {
        await tx.delinkRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            statusMessage: note || 'Delink Failed'
          }
        });

        // --- Refund Logic ---
        if (refund) {
          const transaction = await tx.transaction.findFirst({
            where: {
              userId: delinkRequest.userId,
              serviceId: SERVICE_ID,
              type: 'SERVICE_CHARGE',
              // Optional: match exact timestamp or description if needed for strictness
            },
            orderBy: { createdAt: 'desc' }
          });

          if (transaction) {
            const refundAmount = transaction.amount.abs(); 
            
            // Credit Wallet
            await tx.wallet.update({
              where: { userId: delinkRequest.userId },
              data: { balance: { increment: refundAmount } }
            });

            // Log Refund
            await tx.transaction.create({
              data: {
                userId: delinkRequest.userId,
                type: 'REFUND',
                amount: refundAmount,
                description: `Refund: NIN Delink Failed (${delinkRequest.nin})`,
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
    console.error("Process Delink Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
