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
    // "World-Class" URL parsing to get the serviceId
    const url = new URL(request.url);
    const serviceId = url.searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required.' }, { status: 400 });
    }

    const requests = await prisma.examPinRequest.findMany({
      where: { 
        userId: user.id,
        serviceId: serviceId,
        status: 'COMPLETED' // Only show successful purchases
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Get the last 20
    });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Fetch Exam Pin History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}
