import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct for your project

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    const rawSecret = process.env.PAYSTACK_SECRET_KEY || '';

    // CRITICAL FIX: Remove "Bearer " if it exists in the .env variable
    // so the HMAC signature perfectly matches what Paystack expects.
    const cleanSecret = rawSecret.replace(/^Bearer\s+/i, '').trim();

    // Verify request is actually from Paystack
    const expectedSignature = crypto.createHmac('sha512', cleanSecret).update(rawBody).digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('PAYSTACK WEBHOOK REJECTED: Invalid Signature.');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log(`PAYSTACK WEBHOOK RECEIVED: Event -> ${payload.event}`);

    // Only process successful payments
    if (payload.event === 'charge.success') {
      const data = payload.data;
      const email = data.customer.email;
      const amountInNaira = data.amount / 100; // Convert kobo back to Naira
      const reference = data.reference;

      console.log(`Processing payment for ${email} - Amount: ₦${amountInNaira} - Ref: ${reference}`);

      // Ensure idempotency (Don't fund the same transaction twice)
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference: reference }
      });

      if (existingTransaction) {
        console.log(`Transaction ${reference} already processed. Skipping.`);
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // Find User
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        console.error(`Paystack Webhook Failed: User with email ${email} not found in database.`);
        return NextResponse.json({ message: 'User not found' }, { status: 200 }); // Still return 200 so Paystack stops retrying
      }

      // Execute Wallet Credit and Log Transaction Safely
      await prisma.$transaction([
        // FIX: Use upsert to guarantee a wallet exists before trying to update it
        prisma.wallet.upsert({
          where: { userId: user.id },
          update: { 
            balance: { increment: amountInNaira } 
          },
          create: { 
            userId: user.id, 
            balance: amountInNaira 
          }
        }),
        
        // FIX: Pass the raw number to the amount field, Prisma handles the Decimal conversion
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
      
      console.log(`SUCCESS: Wallet funded for ${email} with ₦${amountInNaira}`);
    }

    // Always return 200 OK to Paystack so they know we got it
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error: any) {
    console.error('PAYSTACK WEBHOOK CRITICAL ERROR:', error.message);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
