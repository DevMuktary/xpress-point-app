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
    const { 
      serviceId, 
      formData, 
      statusReportUrl
    } = body;

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Service ID and Form Data are required.' }, { status: 400 });
    }

    // 1. Get Service
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // 2. Check Wallet
    const price = new Decimal(service.defaultAgentPrice);
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();

    // 3. Execute Transaction (No Commission Here)
    await prisma.$transaction(async (tx) => {
      // a) Charge User
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // NOTE: Commission is NOT paid here. Paid by Admin on Completion.

      // b) Create Request
      await tx.tinRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any,
          statusReportUrl: statusReportUrl || null,
        },
      });

      // c) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: negatedPriceAsString,
          description: `${service.name}`,
          reference: `TIN-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted successfully! You can monitor its status on the TIN History page.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`TIN (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
