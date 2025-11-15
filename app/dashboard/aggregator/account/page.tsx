import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AggregatorAccountClientPage from '@/components/AggregatorAccountClientPage'; // We will create this

// This is a Server Component.
export default async function AggregatorAccountPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. Get the user's current, active bank details
  const currentDetails = {
    bankName: user.bankName || 'Not Set',
    accountNumber: user.accountNumber || 'Not Set',
    accountName: user.accountName || 'Not Set',
  };

  // 2. Check if a change is already pending admin approval
  const pendingChange = await prisma.pendingAccountChange.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/aggregator" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <BanknotesIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Payout Account
        </h1>
      </div>
      
      {/* 3. Pass all data to the Client Component */}
      <AggregatorAccountClientPage 
        currentDetails={currentDetails}
        pendingChange={pendingChange}
      />
    </div>
  );
}
