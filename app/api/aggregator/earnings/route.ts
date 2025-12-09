import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// Type definition
type CommissionEarning = {
  id: string;
  createdAt: Date;
  agentName: string;
  serviceName: string;
  commission: Decimal;
};

export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    // 1. Fetch "COMMISSION" type transactions for this Aggregator
    // These are only created when processCommission() successfully runs.
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id, // <--- Fetch AGGREGATOR'S transactions
        type: 'COMMISSION', // <--- Only Commission receipts
        status: 'COMPLETED'
      },
      include: {
        service: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 
    });

    // 2. Format the data for the frontend
    const earnings: CommissionEarning[] = transactions.map(t => {
      // We stored "Commission from [Agent Name]" in the description
      // Let's clean it up to just show the name if possible, or show the full description
      let displayAgent = t.description.replace('Commission from ', '');

      return {
        id: t.id,
        createdAt: t.createdAt,
        agentName: displayAgent, // Shows: "John Doe"
        serviceName: t.service?.name || 'Service Commission',
        commission: t.amount // This is the actual amount added to wallet
      };
    });
  
    return NextResponse.json({ earnings });

  } catch (error: any) {
    console.error("Fetch Earnings History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch earnings history.' },
      { status: 500 }
    );
  }
}
