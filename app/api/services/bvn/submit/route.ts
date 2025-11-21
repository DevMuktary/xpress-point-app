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
      // File URLs
      failedEnrollmentUrl,
      vninSlipUrl,
      newspaperUrl
    } = body; 

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Service ID and Form Data are required.' }, { status: 400 });
    }

    // 1. Get Service
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    // --- PRICING LOGIC FIX ---
    // Base price is ALWAYS defaultAgentPrice
    const price = new Decimal(service.defaultAgentPrice);
    // -------------------------
    
    // 2. Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${price.toString()}.` }, { status: 402 });
    }

    // --- COMMISSION LOGIC ---
    let commissionAmount = new Decimal(0);
    let aggregatorWalletId = null;

    // If user is an Agent under an Aggregator, calculate commission
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
        // Set the aggregator ID to credit
        aggregatorWalletId = user.aggregatorId;
      }
    }
    // ------------------------

    // 3. Execute Transaction
    const priceAsString = price.toString();
    const negatedPriceAsString = price.negated().toString();
    const commissionAsString = commissionAmount.toString();

    await prisma.$transaction(async (tx) => {
      // a) Charge User Wallet
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: priceAsString } }, // FIX: Use string
      });

      // b) Credit Aggregator Commission (if applicable)
      if (aggregatorWalletId && commissionAmount.greaterThan(0)) {
        await tx.wallet.update({
          where: { userId: aggregatorWalletId },
          data: { commissionBalance: { increment: commissionAsString } } // FIX: Use string
        });
      }

      // c) Create the new request
      await tx.bvnRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any,
          
          // File mappings
          failedEnrollmentUrl: failedEnrollmentUrl || null,
          vninSlipUrl: vninSlipUrl || null,
          newspaperUrl: newspaperUrl || null
        },
      });

      // d) Log the transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: negatedPriceAsString, // FIX: Use string
          description: `${service.name}`,
          reference: `BVN-MANUAL-${Date.now()}`,
          status: 'COMPLETED',
        },
      });
    });

    return NextResponse.json(
      { message: 'Request submitted! Please go to the BVN History page to monitor your status.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`BVN Manual (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
