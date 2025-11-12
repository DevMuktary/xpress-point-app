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

    // --- 1. Get Price & Check Wallet ---
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price}.` }, { status: 402 });
    }

    // --- 2. Charge User & Save as PENDING ---
    await prisma.$transaction([
      // a) Charge wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      // b) Create the new request
      prisma.tinRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING', // <-- PENDING, as you designed
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any, // Save all the form data
          statusReportUrl: statusReportUrl || null,
        },
      }),
      // c) Log the transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `${service.name}`,
          reference: `TIN-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

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
