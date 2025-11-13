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
    // "World-Class" URL parsing to get the category
    const url = new URL(request.url);
    const category = url.searchParams.get('category'); // e.g., "VTU_AIRTIME"

    if (!category) {
      return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    }

    const requests = await prisma.vtuRequest.findMany({
      where: { 
        userId: user.id,
        service: {
          category: category // Filter by the category
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Get the last 20
    });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Fetch VTU History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch history.' },
      { status: 500 }
    );
  }
}
