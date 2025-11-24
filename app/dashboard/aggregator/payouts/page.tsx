import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PayoutsClientPage from '@/components/PayoutsClientPage';
import { Decimal } from '@prisma/client/runtime/library';

export default async function PayoutsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. Get Aggregator Details
  const currentDetails = {
    bankName: user.bankName || 'Not Set',
    accountNumber: user.accountNumber || 'Not Set',
    accountName: user.accountName || 'Not Set',
  };

  // 2. Fetch Wallet & History
  const [wallet, requests, pendingChange] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId: user.id },
      select: { commissionBalance: true } // Ensure we fetch the correct field
    }),
    prisma.withdrawalRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.pendingAccountChange.findUnique({
      where: { userId: user.id },
    })
  ]);

  const commissionBalance = wallet?.commissionBalance || new Decimal(0);
  
  // --- DEBUG LOG ---
  console.log(`DEBUG: Aggregator ${user.email} Commission Balance:`, commissionBalance.toString());

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/aggregator" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <BanknotesIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          My Payouts
        </h1>
      </div>
      
      {/* Client Component */}
      <PayoutsClientPage 
        currentBalance={commissionBalance.toNumber()} 
        initialRequests={requests}
        currentDetails={currentDetails}
        pendingChange={pendingChange}
      />
    </div>
  );
}
