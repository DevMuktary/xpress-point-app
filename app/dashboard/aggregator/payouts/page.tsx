import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PayoutsClientPage from '@/components/PayoutsClientPage'; // We will create this next
import { Decimal } from '@prisma/client/runtime/library';

// This is a "world-class" Server Component
export default async function PayoutsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. "Fetch" the "stunning" wallet and history
  const [wallet, requests] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId: user.id },
      select: { commissionBalance: true }
    }),
    prisma.withdrawalRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const commissionBalance = wallet?.commissionBalance || new Decimal(0);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/aggregator" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <BanknotesIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          My Payouts
        </h1>
      </div>
      
      {/* 2. Pass the "world-class" data to the client */}
      <PayoutsClientPage 
        currentBalance={commissionBalance.toNumber()} 
        initialRequests={requests}
      />
    </div>
  );
}
