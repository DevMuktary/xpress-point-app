import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // "World-class" logic: only get requests from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
    const requests = await prisma.ninVerification.findMany({
      where: { 
        userId: user.id,
        createdAt: {
          gte: twentyFourHoursAgo 
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        data: true, // We need the full data to show the name
      }
    });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Fetch Verification History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}
