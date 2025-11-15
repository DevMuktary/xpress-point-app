import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

// "World-class" type for our commission log
type CommissionEarning = {
  id: string;
  createdAt: Date;
  agentName: string;
  serviceName: string;
  commission: Decimal;
};

// "World-class" helper function to get earnings
async function getCommissionEarnings(aggregatorId: string): Promise<CommissionEarning[]> {
  // 1. Get all agents for this aggregator
  const agents = await prisma.user.findMany({
    where: { aggregatorId: aggregatorId },
    select: { id: true, firstName: true, lastName: true }
  });
  
  const agentIds = agents.map(a => a.id);
  if (agentIds.length === 0) {
    return []; // No agents, no earnings
  }
  
  // 2. Get all commission rates set by the Super-Admin
  const commissionPrices = await prisma.aggregatorPrice.findMany({
    where: { aggregatorId: aggregatorId },
    select: { serviceId: true, commission: true }
  });
  
  const commissionMap = new Map(commissionPrices.map(c => [c.serviceId, c.commission]));

  // 3. Get all transactions from those agents
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: { in: agentIds },
      status: 'COMPLETED',
      serviceId: { not: null }
    },
    include: {
      user: {
        select: { firstName: true, lastName: true }
      },
      service: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Get the 50 most recent
  });

  // 4. "Refurbish" the data
  const earnings: CommissionEarning[] = transactions.map(t => {
    const commission = commissionMap.get(t.serviceId!) || new Decimal(0);
    return {
      id: t.id,
      createdAt: t.createdAt,
      agentName: `${t.user.firstName} ${t.user.lastName}`,
      serviceName: t.service!.name,
      commission: commission
    };
  }).filter(e => e.commission.greaterThan(0)); 
  
  return earnings;
}


export async function GET(request: Request) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const earnings = await getCommissionEarnings(user.id);
    return NextResponse.json({ earnings });

  } catch (error: any) {
    console.error("Fetch Earnings History Error:", error.message);
    return NextResponse.json(
      { error: 'Failed to fetch earnings history.' },
      { status: 500 }
    );
  }
}
