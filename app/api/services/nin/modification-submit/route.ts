import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';
import { DOB_5_YEAR_FEE } from '@/lib/config'; // <-- Import from our new config

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { serviceId, formData, isDobGap, attestationUrl } = body; 

    if (!serviceId || !formData) {
      return NextResponse.json({ error: 'Service ID and Form Data are required.' }, { status: 400 });
    }

    // --- 1. Get Base Price From Database ---
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is currently unavailable.' }, { status: 503 });
    }
    
    let finalPrice = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;

    // --- 2. "World-Class" Dynamic Pricing Logic ---
    if (serviceId === 'NIN_MOD_DOB' && isDobGap === true) {
      finalPrice = finalPrice.plus(DOB_5_YEAR_FEE);
    }
    // ------------------------------------------

    // --- 3. Check User Wallet ---
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(finalPrice)) {
      return NextResponse.json({ error: `Insufficient funds. This service costs ₦${finalPrice}.` }, { status: 402 });
    }

    // --- 4. Charge User & Save as PENDING ---
    await prisma.$transaction([
      // a) Charge wallet
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: finalPrice } },
      }),
      // b) Create the new request
      prisma.modificationRequest.create({
        data: {
          userId: user.id,
          serviceId: serviceId,
          status: 'PENDING',
          statusMessage: 'Request submitted. Awaiting admin review.',
          formData: formData as any,
          attestationUrl: attestationUrl || null,
        },
      }),
      // c) Log the transaction
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: finalPrice.negated(),
          description: `${service.name} (${formData.nin})`,
          reference: `NIN-MOD-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    return NextResponse.json(
      { message: 'Request submitted successfully! You can monitor its status on the NIN Modification History page.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error(`NIN Modification (Submit) Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
