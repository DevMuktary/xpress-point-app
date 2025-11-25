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
    const { requestId, action, rejectionReason } = body; // action: 'APPROVE' | 'REJECT'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Get the request
    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: { user: true } // We need the user to refund them if rejected
    });

    if (!withdrawal) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: 'This request has already been processed.' }, { status: 400 });
    }

    // 2. Handle Logic
    await prisma.$transaction(async (tx) => {
      if (action === 'APPROVE') {
        // A. Mark as Completed
        await tx.withdrawalRequest.update({
          where: { id: requestId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
        
        // Optional: You could log a transaction record here for accounting if you wanted

      } else if (action === 'REJECT') {
        // B. Mark as Failed & Refund
        await tx.withdrawalRequest.update({
          where: { id: requestId },
          data: {
            status: 'FAILED',
            completedAt: new Date() // Used as "Rejected At"
          }
        });

        // Refund the Commission Balance
        await tx.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            commissionBalance: { increment: withdrawal.amount.toString() }
          }
        });
      }
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Payout Process Error:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
