import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { formData, affidavitUrl } = await request.json();

    // Basic Validation
    if (!formData.surname || !formData.firstName || !affidavitUrl) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const SERVICE_ID = 'NPC_ATTESTATION';

    // 1. Get Service & Price
    const service = await prisma.service.findUnique({ where: { id: SERVICE_ID } });
    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
    }

    const amount = service.defaultAgentPrice;

    // 2. Check Wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || wallet.balance.lessThan(amount)) {
      return NextResponse.json({ error: 'Insufficient funds.' }, { status: 402 });
    }

    // 3. Execute Transaction (Deduct + Create Request)
    await prisma.$transaction(async (tx) => {
      // Deduct
      await tx.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: amount } }
      });

      // Create Request
      await tx.npcRequest.create({
        data: {
          userId: user.id,
          serviceId: SERVICE_ID,
          status: 'PENDING',
          statusMessage: 'Application Submitted. Awaiting Processing.',
          formData: formData,
          affidavitUrl: affidavitUrl
        }
      });

      // Log Transaction
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'SERVICE_CHARGE',
          amount: amount.negated(),
          description: `NPC Attestation Charge`,
          reference: `NPC-${Date.now()}`,
          status: 'COMPLETED',
          serviceId: SERVICE_ID
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Application Submitted Successfully!' });

  } catch (error: any) {
    console.error("NPC Submit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
