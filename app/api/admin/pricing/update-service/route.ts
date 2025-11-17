import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: Request) {
  // 1. Check if user is an ADMIN
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // --- THIS IS THE FIX (Part 1) ---
    // We now get both prices from the client
    const { serviceId, newPlatformPrice, newAgentPrice } = body;

    if (!serviceId || newPlatformPrice === undefined || newAgentPrice === undefined) {
      return NextResponse.json({ error: 'Service ID, Platform Price, and Agent Price are required.' }, { status: 400 });
    }
    
    // 2. Validate the prices
    let platformPriceDecimal;
    let agentPriceDecimal;
    try {
      platformPriceDecimal = new Decimal(newPlatformPrice);
      agentPriceDecimal = new Decimal(newAgentPrice);
    } catch {
      return NextResponse.json({ error: 'Invalid price format.' }, { status: 400 });
    }

    if (platformPriceDecimal.isNegative() || agentPriceDecimal.isNegative()) {
      return NextResponse.json({ error: 'Prices cannot be negative.' }, { status: 400 });
    }
    
    // --- THIS IS THE FIX (Part 2) ---
    // 3. Update the database with *both* fields
    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        platformPrice: platformPriceDecimal,
        defaultAgentPrice: agentPriceDecimal,
      },
    });
    // ------------------------------------

    return NextResponse.json({
      message: 'Price updated successfully!',
      updatedService: updatedService,
    });

  } catch (error: any) {
    console.error(`Admin Price Update Error:`, error.message);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
