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
    // We expect 'validationType' from the client ('NO_RECORD' or 'UPDATE_RECORD')
    const { nin, validationType } = await request.json(); 

    if (!nin || !validationType) {
      return NextResponse.json({ error: 'NIN and Validation Type are required.' }, { status: 400 });
    }

    // Map frontend types to the Service IDs in your DB (from seed.ts)
    let serviceId = '';
    if (validationType === 'NO_RECORD') serviceId = 'NIN_VAL_NO_RECORD';
    else if (validationType === 'UPDATE_RECORD') serviceId = 'NIN_VAL_UPDATE_RECORD';
    else return NextResponse.json({ error: 'Invalid Validation Type' }, { status: 400 });

    // 1. Get Service & Price
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    const price = new Decimal(service.defaultAgentPrice);

    // 2. Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. Cost: ₦${price}.` }, { status: 402 });
    }

    // 3. Check Duplicates
    // FIX: Changed 'type' to 'scode' to match schema
    const existingRequest = await prisma.validationRequest.findFirst({
      where: { 
        userId: user.id, 
        nin: nin,
        scode: validationType, 
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending request for this NIN.' }, { status: 409 });
    }

    // 4. Execute Transaction
    await prisma.$transaction(async (tx) => {
      // a) Charge Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      });

      // b) Create Request (Manual status: PENDING)
      // FIX: Changed 'type' to 'scode' here as well
      await tx.validationRequest.create({
        data: {
          userId: user.id,
          nin: nin,
          scode: validationType, 
          status: 'PENDING',
          statusMessage: 'Submitted. Awaiting Admin processing.'
        },
      });

      // c) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `NIN Validation (${validationType}) - ${nin}`,
          reference: `NIN-VAL-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted successfully! Check history for updates.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`NIN Validation Error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
