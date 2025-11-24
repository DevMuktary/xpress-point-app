import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// POST: Update Global Commission for a Service
export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // Strict Admin Check
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { serviceId, commission } = body;

    if (!serviceId || commission === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Update the Service model directly
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        aggregatorCommission: commission
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Global Commission Update Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
