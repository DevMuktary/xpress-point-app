import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { URL } from 'url';

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // --- THIS IS THE "WORLD-CLASS" FIX ---
    // We fetch history for BOTH JAMB pin types
    const requests = await prisma.examPinRequest.findMany({
      where: { 
        userId: user.id,
        serviceId: {
          in: ['JAMB_UTME_PIN', 'JAMB_DE_PIN']
        },
        status: 'COMPLETED' // Only show successful purchases
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Get the last 20
    });
    // ------------------------------------

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Fetch JAMB Pin History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}
