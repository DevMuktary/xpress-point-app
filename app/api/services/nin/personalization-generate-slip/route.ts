import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { generateNinSlipPdf } from '@/lib/slipGenerator'; // We re-use our "world-class" generator
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
    // This API gets the *request ID* (from the Personalization history)
    const { requestId, slipType } = body; 

    if (!requestId || !slipType) {
      return NextResponse.json({ error: 'Missing requestId or slipType.' }, { status: 400 });
    }

    const serviceId = serviceIdMap[slipType];
    if (!serviceId) {
      return NextResponse.json({ error: 'Invalid slipType.' }, { status: 400 });
    }

    // --- 1. Get Price & Personalization Data ---
    const [service, personalizationRequest] = await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.personalizationRequest.findUnique({
        where: { id: requestId, userId: user.id },
      }),
    ]);

    if (!service || !service.isActive) {
      return NextResponse.json({ error: 'This slip service is unavailable.' }, { status: 503 });
    }
    if (!personalizationRequest || personalizationRequest.status !== 'COMPLETED' || !personalizationRequest.data) {
      return NextResponse.json({ error: 'Invalid or incomplete personalization request.' }, { status: 404 });
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
          description: `${service.name} (from Personalization ${personalizationRequest.trackingId})`,
          reference: `NIN-SLIP-PERS-${Date.now()}`,
          status: 'COMPLETED',
          // We don't link this to a 'verificationId' as it's from a 'personalizationRequest'
        },
      }),
    ]);

    // --- 4. Generate the PDF ---
    // We use the 'data' we saved in the PersonalizationRequest
    const pdfBuffer = await generateNinSlipPdf(
      slipType,
      personalizationRequest.data as any
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
    console.error("Personalization Slip Gen Error:", error); 
    
    let errorMessage = "An internal server error occurred.";
    if (error.message) { errorMessage = error.message; }
    if (error.code === 'ENOENT') {
      errorMessage = "Service configuration error: Missing required template files. Please contact support.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
