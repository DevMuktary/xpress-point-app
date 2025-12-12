import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { generateNinSlipPdf } from '@/lib/slipGenerator';
import { Decimal } from '@prisma/client/runtime/library';
import { processCommission } from '@/lib/commission';

const serviceIdMap: { [key: string]: string } = {
  Regular: 'NIN_SLIP_REGULAR',
  Standard: 'NIN_SLIP_STANDARD',
  Premium: 'NIN_SLIP_PREMIUM',
};

export async function POST(request: Request) {
  const user = await getUserFromSession();
  if (!user || !user.isIdentityVerified) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { verificationId, slipType } = body;

    if (!verificationId || !slipType) {
      return NextResponse.json({ error: 'Missing verificationId or slipType.' }, { status: 400 });
    }

    const serviceId = serviceIdMap[slipType];
    if (!serviceId) {
      return NextResponse.json({ error: 'Invalid slipType.' }, { status: 400 });
    }

    // --- 1. Get Data ---
    const [service, verification] = await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.ninVerification.findUnique({
        where: { id: verificationId, userId: user.id },
      }),
    ]);

    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This service is unavailable.' }, { status: 503 });
    }
    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired verification ID.' }, { status: 404 });
    }

    // --- 2. CHECK FOR PREVIOUS PAYMENT (REPRINT LOGIC) ---
    // We check if a COMPLETED transaction already exists for this exact verification & service type.
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        serviceId: serviceId,
        verificationId: verificationId,
        status: 'COMPLETED',
        type: 'SERVICE_CHARGE' // Ensure it was a charge, not a refund
      }
    });

    const isReprint = !!existingTransaction;

    // --- 3. Process Charge ONLY if NOT a reprint ---
    if (!isReprint) {
        
        const price = new Decimal(service.defaultAgentPrice);
        const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });

        if (!wallet || wallet.balance.lessThan(price)) {
          return NextResponse.json({ error: 'Insufficient funds.' }, { status: 402 });
        }

        const priceAsString = price.toString();

        await prisma.$transaction(async (tx) => {
          // a) Charge User
          await tx.wallet.update({
            where: { userId: user.id },
            data: { balance: { decrement: priceAsString } },
          });

          // b) Pay Commission (ONLY ON FIRST PURCHASE)
          await processCommission(tx, user.id, service.id);

          // c) Log Transaction
          await tx.transaction.create({
            data: {
              userId: user.id,
              serviceId: service.id,
              type: 'SERVICE_CHARGE',
              amount: price.negated(),
              description: `${service.name} (${(verification.data as any).nin})`,
              reference: `NIN-SLIP-${Date.now()}`,
              status: 'COMPLETED',
              verificationId: verification.id, 
            },
          });
        });
    } 
    // else { console.log("Reprint detected. Skipping charge & commission."); }

    // --- 4. Generate the PDF (Always happens) ---
    const pdfBuffer = await generateNinSlipPdf(
      slipType,
      verification.data as any
    );

    // --- 5. Send PDF ---
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nin_slip_${slipType.toLowerCase()}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("NIN Slip Generation Error:", error); 
    return NextResponse.json({ error: error.message || "An internal server error occurred." }, { status: 500 });
  }
}
