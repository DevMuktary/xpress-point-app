import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { generateNinSlipPdf } from '@/lib/slipGenerator'; // We will create this
import { Decimal } from '@prisma/client/runtime/library';

// Helper to map slipType to database service ID
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
    const { verificationId, slipType } = body; // e.g., slipType = "Regular"

    if (!verificationId || !slipType) {
      return NextResponse.json({ error: 'Missing verificationId or slipType.' }, { status: 400 });
    }

    const serviceId = serviceIdMap[slipType];
    if (!serviceId) {
      return NextResponse.json({ error: 'Invalid slipType.' }, { status: 400 });
    }

    // --- 1. Get Price & Verification Data ---
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

    // --- 2. Check User Wallet ---
    const price = user.role === 'AGGREGATOR' ? service.aggregatorPrice : service.agentPrice;
    const wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet || wallet.balance.lessThan(price)) {
      return NextResponse.json({ error: 'Insufficient funds for this slip.' }, { status: 402 });
    }

    // --- 3. Charge User & Log Transaction ---
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: user.id },
        data: { balance: { decrement: price } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          serviceId: service.id,
          type: 'SERVICE_CHARGE',
          amount: price.negated(),
          description: `${service.name} (${(verification.data as any).nin})`,
          reference: `NIN-SLIP-${Date.now()}`,
          status: 'COMPLETED',
        },
      }),
    ]);

    // --- 4. Generate the PDF ---
    // The slipGenerator will return the PDF as a Buffer
    const pdfBuffer = await generateNinSlipPdf(
      slipType,
      verification.data as any // Pass the saved JSON data
    );

    // --- 5. Send the PDF file back ---
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nin_slip_${slipType.toLowerCase()}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("NIN Slip Generation Error:", error.message);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
