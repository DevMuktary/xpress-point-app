import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const DEPOSIT_FEE = new Decimal(30); // The ₦30 charge

export async function POST(request: Request) {
  try {
    // 1. Get Raw Body
    const rawBody = await request.text();
    
    // --- FIX: SKIPPING SIGNATURE VERIFICATION ---
    // Since we don't have a webhook secret, we proceed directly.
    // --------------------------------------------

    // 2. Parse the JSON
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log("Webhook received:", JSON.stringify(payload));

    // 3. Check Transaction Status
    // Documentation says: "notification_status": "payment_successful"
    if (payload.notification_status !== 'payment_successful') {
      // We only care about successful payments. Return 200 to acknowledge.
      return NextResponse.json({ message: 'Ignored: Not a success notification' }, { status: 200 });
    }

    const transactionId = payload.transaction_id;
    const amountPaidVal = payload.amount_paid;
    const customerEmail = payload.customer?.email;

    if (!transactionId || !amountPaidVal || !customerEmail) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // 4. Check for Duplicate Transaction (Idempotency)
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference: transactionId }
    });

    if (existingTransaction) {
      return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
    }

    // 5. Find the User
    const user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      console.error(`Webhook Error: User with email ${customerEmail} not found.`);
      // Return 200 so Payment Point stops retrying for an invalid user
      return NextResponse.json({ message: 'User not found' }, { status: 200 });
    }

    // 6. Calculate Amount to Credit (Amount Paid - ₦30 Fee)
    const amountPaid = new Decimal(amountPaidVal);
    const amountToCredit = amountPaid.minus(DEPOSIT_FEE);

    if (amountToCredit.isNegative() || amountToCredit.isZero()) {
      console.error(`Webhook Error: Amount too small after fee deduction. Paid: ${amountPaid}, Fee: ${DEPOSIT_FEE}`);
      return NextResponse.json({ message: 'Amount too small' }, { status: 200 });
    }

    // 7. Process Transaction (Fund Wallet)
    // Use string for Decimal inputs in Prisma
    const creditAmountString = amountToCredit.toString();

    await prisma.$transaction([
      // a) Credit Wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: creditAmountString } }
      }),
      
      // b) Log the Transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'WALLET_FUNDING',
          amount: creditAmountString, // Positive amount for funding
          description: `Wallet funding via Payment Point (₦${amountPaid} - ₦30 Fee)`,
          reference: transactionId,
          status: 'COMPLETED'
        }
      })
    ]);

    console.log(`Webhook Success: Funded ${user.email} with ₦${amountToCredit}`);
    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
