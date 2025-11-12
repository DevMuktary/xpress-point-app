import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // Get the 'id' (requestId) from the URL, e.g., ...?id=...
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get('id');

  if (!requestId) {
    return NextResponse.json({ error: 'Request ID is required.' }, { status: 400 });
  }

  try {
    // 1. Find the completed request in our database
    const request = await prisma.personalizationRequest.findFirst({
      where: { 
        id: requestId, 
        userId: user.id, // Ensure the user owns this request
        status: 'COMPLETED'
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Completed request not found.' }, { status: 404 });
    }

    // 2. Get the prices for the slip buttons
    const slipPrices = await prisma.service.findMany({
      where: {
        id: { in: ['NIN_SLIP_REGULAR', 'NIN_SLIP_STANDARD', 'NIN_SLIP_PREMIUM'] }
      },
      select: { id: true, agentPrice: true, aggregatorPrice: true }
    });
    
    const getPrice = (id: string) => {
      const s = slipPrices.find(sp => sp.id === id);
      if (!s) return 0;
      return user.role === 'AGGREGATOR' ? s.aggregatorPrice : s.agentPrice;
    };

    // 3. Send the data and prices to the frontend
    return NextResponse.json({
      data: request.data, // This is the saved JSON from Robosttech
      slipPrices: {
        Regular: getPrice('NIN_SLIP_REGULAR'),
        Standard: getPrice('NIN_SLIP_STANDARD'),
        Premium: getPrice('NIN_SLIP_PREMIUM'),
      }
    });

  } catch (error: any) {
    console.error("Personalization Result Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch result data.' },
      { status: 500 }
    );
  }
}
