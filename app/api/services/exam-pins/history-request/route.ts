import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const requests = await prisma.resultRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      // "World-class" include to get the service name
      include: {
        service: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Fetch Result Request History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}
