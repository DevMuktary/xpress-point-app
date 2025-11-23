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
    const { serviceId, formData } = body; 

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Service ID and Form Data are required.' }, { status: 400 });
    }

    // --- 1. Get Service & Validate ---
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // --- 2. Set Price (Standardized to Default Agent Price) ---
    // Using defaultAgentPrice for everyone so commission can be extracted
    const price = new Decimal(service.defaultAgentPrice);
    
    // --- 3. Check Wallet ---
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    // --- 4. Calculate Commission (New Logic) ---
    let commissionAmount = new Decimal(0);
    let aggregatorWalletId = null;

    if (user.role === 'AGENT' && user.aggregatorId) {
      const aggregatorPrice = await prisma.aggregatorPrice.findUnique({
        where: {
          aggregatorId_serviceId: {
            aggregatorId: user.aggregatorId,
            serviceId: serviceId
          }
        }
      });

      if (aggregatorPrice) {
        commissionAmount = new Decimal(aggregatorPrice.commission);
        aggregatorWalletId = user.aggregatorId;
      }
    }

    const priceAsString = price.toString();
    const commissionAsString = commissionAmount.toString();

    // --- 5. Execute Transaction ---
    await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } },
      });

      // b) Credit Aggregator (if applicable)
      if (aggregatorWalletId && commissionAmount.greaterThan(0)) {
        await tx.wallet.update({
          where: { userId: aggregatorWalletId },
          data: { commissionBalance: { increment: commissionAsString } }
        });
      }

      // c) Create Result Request
      await tx.resultRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any,
        },
      });

      // d) Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `${service.name} (${formData.regNumber})`,
          reference: `EXAM-REQ-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted successfully! You can monitor its status below.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`Result Request (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
