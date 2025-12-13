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

    // --- ACTION: DELETE USER (ROBUST + 30s TIMEOUT) ---
    if (action === 'DELETE_USER') {
      if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

      const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        select: { agentCode: true }
      });

      await prisma.$transaction(async (tx) => {
        const whereUser = { userId: userId };

        // 1. Unlink Downlines (Important: Do this before deleting the aggregator)
        await tx.user.updateMany({ 
          where: { aggregatorId: userId }, 
          data: { aggregatorId: null } 
        });
        
        // 2. Delete BVN Results (Linked by Agent Code)
        if (userToDelete?.agentCode) {
           await tx.bvnEnrollmentResult.deleteMany({ where: { agentCode: userToDelete.agentCode } });
        }

        // 3. Delete NextAuth / Auth Tables 
        try {
          // @ts-ignore
          await tx.account.deleteMany({ where: whereUser });
          // @ts-ignore
          await tx.session.deleteMany({ where: whereUser });
        } catch (e) {
          // Ignore if these tables don't exist
        }

        // 4. Delete Financials & Logs
        await tx.transaction.deleteMany({ where: whereUser });
        await tx.wallet.deleteMany({ where: whereUser });
        await tx.virtualAccount.deleteMany({ where: whereUser });
        await tx.withdrawalRequest.deleteMany({ where: whereUser });
        await tx.pendingAccountChange.deleteMany({ where: whereUser });
        await tx.aggregatorPrice.deleteMany({ where: { aggregatorId: userId } }); 
        
        // 5. Delete Service Requests (The heavy data)
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

        // 6. Delete Security & Chat
        await tx.ninVerification.deleteMany({ where: whereUser });
        await tx.otp.deleteMany({ where: whereUser });
        await tx.passwordResetToken.deleteMany({ where: whereUser });
        
        try {
          await tx.chatMessage.deleteMany({
            where: {
              OR: [
                { userId: userId }, 
                // { receiverId: userId } // Uncomment if needed
              ]
            }
          });
        } catch (e) {
          await tx.chatMessage.deleteMany({ where: { userId: userId } });
        }

        // 7. Finally, Delete the User
        await tx.user.delete({ where: { id: userId } });
      }, 
      // --- TIMEOUT CONFIGURATION ---
      {
        maxWait: 10000, // Max wait to connect (10s)
        timeout: 30000  // Max time for transaction to finish (30s)
      });

      return NextResponse.json({ success: true, message: 'User deleted successfully.' });
    }

    // --- ACTION: RESET SYSTEM (NUCLEAR OPTION) ---
    if (action === 'RESET_SYSTEM') {
      console.log(`[SYSTEM RESET] FORCE WIPE Initiated by Admin: ${admin.email}`);

      await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE 
          "transactions", 
          "wallets", 
          "virtual_accounts", 
          "bvn_enrollment_results", 
          "nin_verifications", 
          "otps", 
          "password_reset_tokens", 
          "chat_messages",
          "aggregator_prices", 
          "withdrawal_requests", 
          "pending_account_changes",
          
          -- Service Requests
          "personalization_requests", 
          "ipe_requests", 
          "validation_requests", 
          "modification_requests", 
          "delink_requests", 
          "newspaper_requests", 
          "cac_requests", 
          "tin_requests", 
          "jamb_requests", 
          "exam_pin_requests", 
          "result_requests", 
          "vtu_requests", 
          "bvn_requests", 
          "vnin_requests", 
          "npc_requests"
        RESTART IDENTITY CASCADE;
      `);

      console.log(`[SYSTEM RESET] Completed Successfully.`);
      return NextResponse.json({ success: true, message: 'System reset complete. All data tables have been truncated.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Manage Error:", error);
    
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        error: `Delete Failed: Data still exists in a linked table. (Field: ${error.meta?.field_name || 'unknown'})` 
      }, { status: 500 });
    }
    
    // Handle Timeout Error specifically
    if (error.code === 'P2028') {
      return NextResponse.json({
        error: "Delete Failed: Operation timed out. The user has too much data. Try deleting their requests manually first."
      }, { status: 504 });
    }

    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
