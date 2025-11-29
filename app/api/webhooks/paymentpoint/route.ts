import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Decimal } from '@prisma/client/runtime/library';

const WEBHOOK_SECRET = process.env.PAYMENTPOINT_WEBHOOK_SECRET;
const DEPOSIT_FEE = new Decimal(30); // The ₦30 charge

export async function POST(request: Request) {
  try {
    // 1. Get Raw Body (for signature verification) and Headers
    const rawBody = await request.text();
    const signature = request.headers.get('paymentpoint-signature');

    if (!WEBHOOK_SECRET) {
      console.error("CRITICAL: PAYMENTPOINT_WEBHOOK_SECRET is not set.");
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    // 2. Verify Signature (Security Check)
    // Hash the raw body using the secret key and compare with the header
    const hash = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.error("Webhook Signature Mismatch!");
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 3. Parse the JSON
    const payload = JSON.parse(rawBody);

    // 4. Check Transaction Status
    if (payload.notification_status !== 'payment_successful' || payload.transaction_status !== 'success') {
      // We only care about successful payments
      return NextResponse.json({ message: 'Ignored: Not a success notification' }, { status: 200 });
    }

    const transactionId = payload.transaction_id;
    const amountPaid = new Decimal(payload.amount_paid);
    const customerEmail = payload.customer?.email;

    if (!transactionId || !amountPaid || !customerEmail) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // 5. Check for Duplicate Transaction (Idempotency)
    // We check if we have already processed this Payment Point reference
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference: transactionId }
    });

    if (existingTransaction) {
      return NextResponse.json({ message: 'Transaction already processed' }, { status: 200 });
    }

    // 6. Find the User
    const user = await prisma.user.findUnique({
      where: { email: customerEmail }
    });

    if (!user) {
      console.error(`Webhook Error: User with email ${customerEmail} not found.`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 7. Calculate Amount to Credit (Amount Paid - ₦30 Fee)
    const amountToCredit = amountPaid.minus(DEPOSIT_FEE);

    if (amountToCredit.isNegative() || amountToCredit.isZero()) {
      console.error(`Webhook Error: Amount too small after fee deduction. Paid: ${amountPaid}, Fee: ${DEPOSIT_FEE}`);
      return NextResponse.json({ message: 'Amount too small' }, { status: 200 });
    }

    // 8. Process Transaction (Fund Wallet)
    await prisma.$transaction([
      // a) Credit Wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { increment: amountToCredit.toString() } }
      }),
      
      // b) Log the Transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'WALLET_FUNDING',
          amount: amountToCredit.toString(), // Positive amount for funding
          description: `Wallet funding via Payment Point (₦${amountPaid} - ₦30 Fee)`,
          reference: transactionId, // Save the Payment Point ref to prevent duplicates
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
