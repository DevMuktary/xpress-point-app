import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EarningsClientPage from '@/components/EarningsClientPage'; // We will create this next
import { Decimal } from '@prisma/client/runtime/library';

// "World-class" type for our commission log
export type CommissionEarning = {
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
    where: { aggregatorId: aggregatorId }, // We use the Aggregator's ID
    select: { serviceId: true, commission: true }
  });
  
  // Create a simple Map for fast lookups
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

  // 4. "Refurbish" the data into the "stunning" list you designed
  const earnings: CommissionEarning[] = transactions.map(t => {
    const commission = commissionMap.get(t.serviceId!) || new Decimal(0);
    return {
      id: t.id,
      createdAt: t.createdAt,
      agentName: `${t.user.firstName} ${t.user.lastName}`,
      serviceName: t.service!.name,
      commission: commission
    };
  }).filter(e => e.commission.greaterThan(0)); // Only show commissions they earned
  
  return earnings;
}


// This is the Server Component.
export default async function MyEarningsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. Get the "stunning" earnings log
  const earnings = await getCommissionEarnings(user.id);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/aggregator" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <CurrencyDollarIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          My Earnings
        </h1>
      </div>
      
      {/* 2. Pass the list of earnings to the Client Component */}
      <EarningsClientPage initialEarnings={earnings} />
    </div>
  );
}
