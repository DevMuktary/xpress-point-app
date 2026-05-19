import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma'; 

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const rawSecret = process.env.PAYSTACK_SECRET_KEY || '';

    // Clean secret and verify signature
    const cleanSecret = rawSecret.replace(/^Bearer\s+/i, '').trim();
    const expectedSignature = crypto.createHmac('sha512', cleanSecret).update(rawBody).digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Paystack Webhook: Invalid Signature');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'charge.success') {
      const { customer, amount, reference } = payload.data;
      const email = customer.email;
      const amountInNaira = amount / 100;

      // Idempotency check to prevent double-funding
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference: reference }
      });

      if (existingTransaction) {
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // Look up user
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        console.error(`Paystack Webhook: User with email ${email} not found.`);
        return NextResponse.json({ message: 'User not found' }, { status: 200 }); 
      }

      // Safely fund wallet and record transaction
      await prisma.$transaction([
        prisma.wallet.upsert({
          where: { userId: user.id },
          update: { balance: { increment: amountInNaira } },
          create: { userId: user.id, balance: amountInNaira }
        }),
        
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: 'WALLET_FUNDING',
            amount: amountInNaira, 
            description: 'Wallet funding via Paystack',
            reference: reference,
            status: 'COMPLETED'
          }
        })
      ]);
      
      console.log(`Paystack: Funded ${email} with ₦${amountInNaira} (Ref: ${reference})`);
    }

    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error: any) {
    console.error('Paystack Webhook Error:', error.message);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
