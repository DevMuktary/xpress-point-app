import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: Request) {
  const admin = await getUserFromSession();
  
  // 1. Security: Strict Admin Check
  if (!admin || admin.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, query, userId, amount, reason } = body; 
    // action: 'SEARCH' | 'FUND' | 'TOGGLE_BLOCK'

    // --- ACTION: SEARCH USER ---
    if (action === 'SEARCH') {
      if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });
      
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: query.toLowerCase() } },
            { phoneNumber: { contains: query } },
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { agentCode: { contains: query } } // Search by Agent Code too
          ]
        },
        take: 5, // Limit results
        include: { wallet: true }
      });

      // Serialize Decimal
      const safeUsers = users.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role,
        isBlocked: u.isBlocked,
        walletBalance: u.wallet?.balance.toString() || "0.00",
        commissionBalance: u.wallet?.commissionBalance.toString() || "0.00"
      }));

      return NextResponse.json({ users: safeUsers });
    }

    // --- ACTION: FUND WALLET ---
    if (action === 'FUND') {
      if (!userId || !amount) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      
      const amountDecimal = new Decimal(amount);
      const amountString = amountDecimal.toString();

      await prisma.$transaction(async (tx) => {
        // 1. Credit Wallet
        await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: amountString } }
        });

        // 2. Log Transaction (Type: ADMIN_CREDIT)
        await tx.transaction.create({
          data: {
            userId,
            serviceId: null, // No specific service
            type: 'ADMIN_CREDIT',
            amount: amountDecimal, // Positive for credit
            description: reason || `Wallet Funded by Admin`,
            reference: `ADM-FUND-${Date.now()}`,
            status: 'COMPLETED'
          }
        });
      });

      return NextResponse.json({ success: true, message: 'Wallet funded successfully' });
    }

    // --- ACTION: BLOCK / UNBLOCK ---
    if (action === 'TOGGLE_BLOCK') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const newStatus = !user.isBlocked;

      await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: newStatus }
      });

      return NextResponse.json({ 
        success: true, 
        message: `User ${newStatus ? 'Blocked' : 'Unblocked'} successfully`,
        isBlocked: newStatus
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Manage User Error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
