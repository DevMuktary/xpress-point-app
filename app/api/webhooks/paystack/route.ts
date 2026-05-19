import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

export async function POST(req: Request) {
  console.log('\n--- 🔔 NEW PAYSTACK WEBHOOK INCOMING ---');
  
  try {
    const rawBody = await req.text();
    console.log(`📦 RAW BODY LENGTH: ${rawBody.length} characters`);
    
    if (rawBody.length === 0) {
      console.error('🚨 CRITICAL ERROR: The webhook body is completely empty!');
      console.error('Fix: Check Paystack dashboard for a trailing slash (e.g. .../paystack/) or ensure you are using HTTPS.');
      return NextResponse.json({ message: 'Empty body' }, { status: 400 });
    }

    const signature = req.headers.get('x-paystack-signature');
    console.log(`🔑 SIGNATURE HEADER: ${signature || 'MISSING'}`);

    const rawSecret = process.env.PAYSTACK_SECRET_KEY || '';
    const cleanSecret = rawSecret.replace(/^Bearer\s+/i, '').trim();
    console.log(`🔐 SECRET KEY USED (first 7 chars): ${cleanSecret.substring(0, 7)}...`);

    // Verify request is actually from Paystack
    const expectedSignature = crypto.createHmac('sha512', cleanSecret).update(rawBody).digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('❌ PAYSTACK WEBHOOK REJECTED: Invalid Signature.');
      console.error(`Received: ${signature}`);
      console.error(`Expected: ${expectedSignature}`);
      console.error('Fix: Your Railway PAYSTACK_SECRET_KEY does not match the key Paystack used to sign this.');
      return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    console.log(`✅ SIGNATURE MATCH! Event Type: -> ${payload.event}`);

    // Only process successful payments
    if (payload.event === 'charge.success') {
      const data = payload.data;
      const email = data.customer.email;
      const amountInNaira = data.amount / 100;
      const reference = data.reference;

      console.log(`💰 Processing Payment: Email: ${email} | Amount: ₦${amountInNaira} | Ref: ${reference}`);

      // Ensure idempotency
      const existingTransaction = await prisma.transaction.findUnique({
        where: { reference: reference }
      });

      if (existingTransaction) {
        console.log(`⚠️ SKIP: Transaction ${reference} was already funded in the database.`);
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }

      // Find User
      console.log(`🔍 DB LOOKUP: Searching for user with email -> ${email}`);
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        console.error(`❌ DB ERROR: User with email ${email} DOES NOT EXIST in the database.`);
        console.error('Fix: Ensure the frontend is sending a registered email address to Paystack.');
        return NextResponse.json({ message: 'User not found' }, { status: 200 }); // Still return 200 so Paystack stops retrying
      }

      console.log(`✅ USER FOUND: ID (${user.id}). Starting database transaction...`);

      // Execute Wallet Credit and Log Transaction Safely
      await prisma.$transaction([
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
      
      console.log(`🎉 MEGA SUCCESS: Wallet funded for ${email} with ₦${amountInNaira}`);
    }

    // Always return 200 OK
    return NextResponse.json({ message: 'Success' }, { status: 200 });

  } catch (error: any) {
    console.error('🔥 PAYSTACK WEBHOOK CRASHED (CATCH BLOCK):', error.message);
    console.error(error.stack);
    return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
  }
}
