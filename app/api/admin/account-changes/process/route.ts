import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function POST(request: Request) {
  const admin = await getUserFromSession();
  
  // Security Check: Admin Only
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 1. Find the pending request
    const requestRecord = await prisma.pendingAccountChange.findUnique({
      where: { id: requestId }
    });

    if (!requestRecord) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // 2. Process in a transaction
    await prisma.$transaction(async (tx) => {
      if (action === 'APPROVE') {
        // A. Update the User's actual bank details
        await tx.user.update({
          where: { id: requestRecord.userId },
          data: {
            bankName: requestRecord.newBankName,
            accountNumber: requestRecord.newAccountNumber,
            accountName: requestRecord.newAccountName
          }
        });
      }

      // B. Delete the request (Whether approved or rejected, it's done)
      await tx.pendingAccountChange.delete({
        where: { id: requestId }
      });
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Account Change Process Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process" }, { status: 500 });
  }
}
