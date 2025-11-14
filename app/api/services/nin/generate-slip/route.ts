import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { generateNinSlipPdf } from '@/lib/slipGenerator';
import { Decimal } from '@prisma/client/runtime/library';

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

    // --- 2. Check User Wallet (THIS IS THE "WORLD-CLASS" FIX) ---
    const price = user.role === 'AGGREGATOR' 
      ? service.platformPrice 
      : service.defaultAgentPrice;
    // --------------------------------------------------
    
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
          verificationId: verification.id, // Link the transaction
        },
      }),
    ]);

    // --- 4. Generate the PDF ---
    const pdfBuffer = await generateNinSlipPdf(
      slipType,
      verification.data as any
    );

    // --- 5. Send the PDF file back ---
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nin_slip_${slipType.toLowerCase()}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("NIN Slip Generation Error:", error); 
    
    let errorMessage = "An internal server error occurred.";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.toString) {
      errorMessage = error.toString();
    }
    
    if (error.code === 'ENOENT') {
      errorMessage = "Service configuration error: Missing required template files. Please contact support.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
