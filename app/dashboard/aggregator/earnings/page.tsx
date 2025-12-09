import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import EarningsClientPage from '@/components/EarningsClientPage'; 
import { Decimal } from '@prisma/client/runtime/library';

// Export type for the client component
export type CommissionEarning = {
  id: string;
  createdAt: Date;
  agentName: string;
  serviceName: string;
  commission: Decimal;
};

// --- NEW LOGIC: Fetch Actual Commission Receipts ---
async function getCommissionEarnings(aggregatorId: string): Promise<CommissionEarning[]> {
  
  // We now fetch the "COMMISSION" transactions that were created
  // specifically for this Aggregator in their own wallet history.
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: aggregatorId, // Look at Aggregator's wallet
      type: 'COMMISSION',   // Only Commission credits
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

  // Format the data
  const earnings: CommissionEarning[] = transactions.map(t => {
    // The description stores "Commission from [Agent Name]"
    // We strip the prefix to get just the name for the UI
    const displayAgent = t.description.replace('Commission from ', '');

    return {
      id: t.id,
      createdAt: t.createdAt,
      agentName: displayAgent,
      serviceName: t.service?.name || 'Service Commission',
      commission: t.amount // This is the exact amount added to the wallet
    };
  });
  
  return earnings;
}

export default async function MyEarningsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. Get the REAL earnings log
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
      
      {/* 2. Pass the list to the Client Component */}
      <EarningsClientPage initialEarnings={earnings} />
    </div>
  );
}
