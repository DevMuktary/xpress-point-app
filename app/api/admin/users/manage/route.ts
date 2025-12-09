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
        await tx.wallet.upsert({
          where: { userId },
          create: { userId, balance: amountString },
          update: { balance: { increment: amountString } }
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

    // --- ACTION: DELETE USER (SAFE MODE) ---
    if (action === 'DELETE_USER') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

      // Try to find the user to get agentCode, but don't fail if they are missing
      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        select: { agentCode: true }
      });

      console.log(`[DELETE] Starting cleanup for User ID: ${userId}`);

      await prisma.$transaction(async (tx) => {
        // 1. Unlink Agents (if this user was an Aggregator)
        await tx.user.updateMany({ where: { aggregatorId: userId }, data: { aggregatorId: null } });
        
        // 2. Delete BVN Results (Linked by Agent Code)
        if (userToDelete?.agentCode) {
           await tx.bvnEnrollmentResult.deleteMany({ where: { agentCode: userToDelete.agentCode } });
        }

        const whereUser = { userId: userId };

        // 3. Delete ALL Related Records (Order matters!)
        // Financials
        await tx.transaction.deleteMany({ where: whereUser });
        await tx.wallet.deleteMany({ where: whereUser });
        await tx.virtualAccount.deleteMany({ where: whereUser });
        await tx.withdrawalRequest.deleteMany({ where: whereUser });
        await tx.pendingAccountChange.deleteMany({ where: whereUser });
        await tx.aggregatorPrice.deleteMany({ where: { aggregatorId: userId } }); 
        
        // Security & Logs
        await tx.ninVerification.deleteMany({ where: whereUser });
        await tx.otp.deleteMany({ where: whereUser });
        await tx.passwordResetToken.deleteMany({ where: whereUser });
        await tx.chatMessage.deleteMany({ where: whereUser });
        
        // Service Requests (Delete all types)
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

        // 4. Finally, try to delete the User
        // Use deleteMany to avoid error if user is already gone
        await tx.user.deleteMany({ where: { id: userId } });
      });

      return NextResponse.json({ success: true, message: 'User and all related traces wiped successfully.' });
    }

    // --- ACTION: RESET SYSTEM (NUCLEAR OPTION) ---
    if (action === 'RESET_SYSTEM') {
      console.log(`[SYSTEM RESET] Initiated by Admin: ${admin.email}`);

      await prisma.$transaction(async (tx) => {
        // 1. Delete Transactions (Highest priority dependency)
        await tx.transaction.deleteMany({});
        
        // 2. Delete Wallets & Financials
        await tx.wallet.deleteMany({});
        await tx.virtualAccount.deleteMany({});
        await tx.aggregatorPrice.deleteMany({});
        await tx.withdrawalRequest.deleteMany({});
        await tx.pendingAccountChange.deleteMany({});

        // 3. Delete Standalone Data
        await tx.bvnEnrollmentResult.deleteMany({});
        await tx.ninVerification.deleteMany({});
        await tx.otp.deleteMany({});
        await tx.passwordResetToken.deleteMany({});
        await tx.chatMessage.deleteMany({});

        // 4. Delete All Service Requests
        await tx.personalizationRequest.deleteMany({});
        await tx.ipeRequest.deleteMany({});
        await tx.validationRequest.deleteMany({});
        await tx.modificationRequest.deleteMany({});
        await tx.delinkRequest.deleteMany({});
        await tx.newspaperRequest.deleteMany({});
        await tx.cacRequest.deleteMany({});
        await tx.tinRequest.deleteMany({});
        await tx.jambRequest.deleteMany({});
        await tx.examPinRequest.deleteMany({});
        await tx.resultRequest.deleteMany({});
        await tx.vtuRequest.deleteMany({});
        await tx.bvnRequest.deleteMany({});
        await tx.vninRequest.deleteMany({});
        await tx.npcRequest.deleteMany({});
      });

      console.log(`[SYSTEM RESET] Completed Successfully.`);
      return NextResponse.json({ success: true, message: 'System reset complete. Database cleaned.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Manage Error:", error);
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
