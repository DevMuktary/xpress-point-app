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
    const { nin, scode } = body; 

    if (!nin || !scode) {
      return NextResponse.json({ error: 'NIN and Validation Type are required.' }, { status: 400 });
    }
    
    // --- 1. Map 'scode' to Database 'type' ---
    // 47 = No Record Found
    // 48, 49, 50 = Record Update (Sim, Bank, Photo errors)
    let validationType = 'NO_RECORD';
    if (scode === '47') {
      validationType = 'NO_RECORD';
    } else {
      validationType = 'RECORD_UPDATE';
    }

    // --- 2. Get Service & Price ---
    const serviceId = `NIN_VALIDATION_${scode}`;
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    const price = new Decimal(service.defaultAgentPrice);
    const priceAsString = price.toString();

    // --- 3. Check Wallet ---
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price}.` }, { status: 402 });
    }

    // --- 4. Check Duplicates (Manual Check) ---
    // We check if there is already a PENDING request for this NIN and Type
    const existingRequest = await prisma.validationRequest.findFirst({
      where: { 
        userId: user.id, 
        nin: nin, 
        type: validationType,
        status: { in: ['PENDING', 'PROCESSING'] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'You already have a pending request for this NIN.' }, { status: 409 });
    }

    // --- 5. Execute Transaction (Manual Submission) ---
    const newRequest = await prisma.$transaction(async (tx) => {
      // a) Charge User
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Create Request (For Admin Review)
      const req = await tx.validationRequest.create({
        data: {
          userId: user.id,
          nin: nin,
          type: validationType, // Storing as NO_RECORD or RECORD_UPDATE
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin validation.',
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
          reference: `VAL-${Date.now()}`,
          status: 'COMPLETED',
        },
      });

      return req;
    });

    return NextResponse.json(
      { 
        message: 'Request submitted successfully! Please check your history for updates.',
        newRequest: newRequest 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`NIN Validation (Submit) Error:`, error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
