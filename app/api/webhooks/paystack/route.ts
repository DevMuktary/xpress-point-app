import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Get raw body to verify signature
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY as string;

    // 2. Verify request is actually from Paystack
    const expectedSignature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (signature !== expectedSignature) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // 3. Only process successful payments
    if (payload.event === 'charge.success') {
      const data = payload.data;
      const email = data.customer.email;
      const amountInNaira = data.amount / 100; // Convert kobo back to Naira
      const reference = data.reference;

      // 4. Ensure idempotency (Don't fund the same transaction twice)
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference: reference }
      });

      if (existingTransaction) {
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // 5. Find User
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        console.error(`Paystack Webhook: User with email ${email} not found.`);
        return NextResponse.json({ message: 'User not found' }, { status: 200 });
      }

      // 6. Execute Wallet Credit and Log Transaction Safely
      await prisma.$transaction([
        prisma.wallet.update({
          where: { userId: user.id },
          data: { balance: { increment: amountInNaira.toString() } }
        }),
        
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'WALLET_FUNDING',
            amount: amountInNaira.toString(),
            description: 'Wallet funding via Paystack',
            reference: reference,
            status: 'COMPLETED'
          }
        })
      ]);
      
      console.log(`Successfully funded ${email} with ₦${amountInNaira}`);
    }

    // Always return 200 OK to Paystack so they stop retrying
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error: any) {
    console.error('Paystack Webhook Error:', error.message);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
