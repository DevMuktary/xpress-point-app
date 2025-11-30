import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { nin } = body; 

    if (!nin) {
      return NextResponse.json({ error: 'NIN is required.' }, { status: 400 });
    }

    // 1. Get Service
    const serviceId = 'NIN_DELINK'; 
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // 2. Set Price
    const price = new Decimal(service.defaultAgentPrice);
    
    // 3. Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    // 4. Check Duplicates
    const existingRequest = await prisma.delinkRequest.findFirst({
      where: { 
        userId: user.id, 
        nin: nin,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });
    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending request for this NIN.' }, { status: 409 });
    }

    const priceAsString = price.toString();

    // 5. Execute Transaction & Capture Result
    // --- THE FIX IS HERE: We capture the result of the transaction ---
    const newDelinkRequest = await prisma.$transaction(async (tx) => {
      // a) Charge User
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Create Request (Capture this variable)
      const createdRequest = await tx.delinkRequest.create({
        data: {
          userId: user.id,
          nin: nin,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.'
        },
      });

      // c) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `NIN Delink / Retrieve Email (${nin})`,
          reference: `NIN-DELINK-${Date.now()}`,
          status: 'COMPLETED',
        },
      });

      // Return the created request from the transaction
      return createdRequest;
    });

    // 6. Return response WITH the newRequest data
    return NextResponse.json(
      { 
        success: true,
        message: 'Request submitted! Please go to the NIN Delink History page to monitor your status.',
        newRequest: newDelinkRequest // <--- The client needs this to prevent the crash
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`NIN Delink (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
