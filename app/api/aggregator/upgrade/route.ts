import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// "World-class" function to create the subdomain
function generateSubdomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove all special chars and spaces
    .substring(0, 30); // Max 30 chars
}

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // "Stunning" check: If user is ALREADY an Aggregator, error
  if (user.role === 'AGGREGATOR') {
    return NextResponse.json({ error: 'You are already an Aggregator.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { bankName, accountNumber, accountName, businessName } = body;

    if (!bankName || !accountNumber || !accountName || !businessName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // --- 1. Get Price & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: 'AGGREGATOR_UPGRADE' } });
    if (!service) {
      throw new Error("AGGREGATOR_UPGRADE service not found.");
    }
    
    // "World-class" logic: This fee is *not* based on role. It's the default.
    const price = service.defaultAgentPrice;
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. Upgrade fee is ₦${price}.` }, { status: 402 });
    }

    // --- 2. Generate "World-Class" Subdomain & Check if it exists ---
    let subdomain = generateSubdomain(businessName);
    const existingSubdomain = await prisma.user.findFirst({
      where: { subdomain: subdomain }
    });
    
    // If "raudahtech" exists, make it "raudahtech2"
    if (existingSubdomain) {
      subdomain = `${subdomain}${Math.floor(Math.random() * 100)}`;
    }

    // --- 3. "World-Class" Transaction ---
    await prisma.$transaction([
      // a) Charge the *main* wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      
      // b) "Refurbish" the User to an AGGREGATOR
      prisma.user.update({
        where: { id: user.id },
        data: {
          role: 'AGGREGATOR',
          bankName: bankName,
          accountNumber: accountNumber,
          accountName: accountName,
          businessName: businessName,
          subdomain: subdomain
        }
      }),
      
      // c) Log the transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `Aggregator Account Upgrade`,
          reference: `AGG-UPG-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 4. Return the "Stunning" Success Response ---
    return NextResponse.json(
      { 
        message: 'Upgrade successful!',
        subdomain: subdomain
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`Aggregator Upgrade Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
