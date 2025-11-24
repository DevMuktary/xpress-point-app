import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

const MINIMUM_PAYOUT = new Decimal(1000); 

export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Security Check: Must be an AGGREGATOR
  if (!user || user.role !== 'AGGREGATOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // 1. Get the aggregator's commission wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 });
    }
    
    const balance = wallet.commissionBalance;

    // 2. Check: Do they have enough to withdraw?
    if (balance.lessThan(MINIMUM_PAYOUT)) {
      return NextResponse.json({ error: `Minimum payout is ₦${MINIMUM_PAYOUT}.` }, { status: 400 });
    }
    
    // 3. Check: Do they have a pending request?
    const existingRequest = await prisma.withdrawalRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    });
    
    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a withdrawal request pending.' }, { status: 409 });
    }
    
    const amountToWithdraw = balance; // They withdraw their entire balance
    const amountString = amountToWithdraw.toString();

    // 4. Execute Transaction
    const [_, newRequest] = await prisma.$transaction([
      // a) Set their commission balance to 0 (decrement by current balance)
      prisma.wallet.update({
        where: { userId: user.id },
        data: { commissionBalance: { decrement: amountString } }
      }),
      // b) Create the PENDING request for the Admin
      prisma.withdrawalRequest.create({
        data: {
          userId: user.id,
          amount: amountToWithdraw,
          status: 'PENDING'
        }
      })
    ]);

    // 5. Return success
    return NextResponse.json(
      { 
        message: 'Withdrawal request submitted successfully! The admin will process it shortly.',
        newRequest: newRequest 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`Withdrawal Request Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
