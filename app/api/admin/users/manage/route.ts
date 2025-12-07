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
            { agentCode: { contains: query } } 
          ]
        },
        take: 5,
        include: { wallet: true }
      });

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
        await tx.wallet.update({
          where: { userId },
          data: { balance: { increment: amountString } }
        });

        await tx.transaction.create({
          data: {
            userId,
            serviceId: null,
            type: 'ADMIN_CREDIT',
            amount: amountDecimal,
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

    // --- ACTION: DELETE USER (New Feature) ---
    if (action === 'DELETE_USER') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

      // Run as a transaction to ensure clean removal
      await prisma.$transaction(async (tx) => {
        
        // 1. Unlink Agents (if this user is an Aggregator)
        // We don't delete the agents, we just remove their aggregator link
        await tx.user.updateMany({
          where: { aggregatorId: userId },
          data: { aggregatorId: null }
        });

        // 2. Delete All Related Records (Manual Cascade)
        // We delete from child tables first to avoid foreign key errors
        const whereUser = { userId: userId };

        await tx.wallet.deleteMany({ where: whereUser });
        await tx.virtualAccount.deleteMany({ where: whereUser });
        await tx.transaction.deleteMany({ where: whereUser });
        await tx.ninVerification.deleteMany({ where: whereUser });
        await tx.otp.deleteMany({ where: whereUser });
        await tx.passwordResetToken.deleteMany({ where: whereUser });
        await tx.chatMessage.deleteMany({ where: whereUser });
        await tx.withdrawalRequest.deleteMany({ where: whereUser });
        await tx.pendingAccountChange.deleteMany({ where: whereUser });
        await tx.aggregatorPrice.deleteMany({ where: { aggregatorId: userId } }); // Special field name

        // Requests
        await tx.personalizationRequest.deleteMany({ where: whereUser });
        await tx.ipeRequest.deleteMany({ where: whereUser });
        await tx.validationRequest.deleteMany({ where: whereUser });
        await tx.modificationRequest.deleteMany({ where: whereUser });
        await tx.delinkRequest.deleteMany({ where: whereUser });
        await tx.newspaperRequest.deleteMany({ where: whereUser });
        await tx.cacRequest.deleteMany({ where: whereUser });
        await tx.tinRequest.deleteMany({ where: whereUser });
        await tx.jambRequest.deleteMany({ where: whereUser });
        await tx.examPinRequest.deleteMany({ where: whereUser });
        await tx.resultRequest.deleteMany({ where: whereUser });
        await tx.vtuRequest.deleteMany({ where: whereUser });
        await tx.bvnRequest.deleteMany({ where: whereUser });
        await tx.vninRequest.deleteMany({ where: whereUser });
        await tx.npcRequest.deleteMany({ where: whereUser });

        // 3. Finally, Delete the User
        await tx.user.delete({
          where: { id: userId }
        });
      });

      return NextResponse.json({ success: true, message: 'User and all related data deleted successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Manage User Error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
