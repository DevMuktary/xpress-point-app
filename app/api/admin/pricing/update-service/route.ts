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
    const { serviceId, newPrice } = body;

    if (!serviceId || newPrice === undefined) {
      return NextResponse.json({ error: 'Service ID and New Price are required.' }, { status: 400 });
    }
    
    // 2. Validate the price
    let priceDecimal;
    try {
      priceDecimal = new Decimal(newPrice);
    } catch {
      return NextResponse.json({ error: 'Invalid price format.' }, { status: 400 });
    }

    if (priceDecimal.isNegative()) {
      return NextResponse.json({ error: 'Price cannot be negative.' }, { status: 400 });
    }
    
    // 3. Update the database
    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        defaultAgentPrice: priceDecimal,
      },
    });

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
