import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const requests = await prisma.personalizationRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      // We don't need to send the full 'data' object, just the status
      select: {
        id: true,
        trackingId: true,
        status: true,
        statusMessage: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Fetch History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}
