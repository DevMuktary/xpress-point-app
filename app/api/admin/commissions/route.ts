import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// POST: Update Default Commission & Push to All Aggregators
export async function POST(request: Request) {
  const user = await getUserFromSession();
  
  // 1. Admin Check
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { serviceId, commission } = body;

    if (!serviceId || commission === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 2. Run Transaction
    await prisma.$transaction(async (tx) => {
      
      // A. Update the "Master" Default
      await tx.service.update({
        where: { id: serviceId },
        data: { defaultCommission: commission }
      });

      // B. "The Magic": Delete existing overrides for this service...
      // (Optional: Or you can choose to only update those that haven't been customized)
      // For simplicity, we align EVERYONE to the new global price.
      await tx.aggregatorPrice.deleteMany({
        where: { serviceId: serviceId }
      });

      // C. Find ALL Aggregators
      const aggregators = await tx.user.findMany({
        where: { role: 'AGGREGATOR' },
        select: { id: true }
      });

      // D. Bulk Insert the new price for EVERY Aggregator
      if (aggregators.length > 0) {
        await tx.aggregatorPrice.createMany({
          data: aggregators.map(agg => ({
            aggregatorId: agg.id,
            serviceId: serviceId,
            commission: commission
          }))
        });
      }
    });

    return NextResponse.json({ success: true, message: "Updated globally!" });

  } catch (error) {
    console.error("Global Commission Update Error:", error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
