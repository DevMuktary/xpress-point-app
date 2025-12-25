import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import WalletHistoryClientPage from '@/components/WalletHistoryClientPage';

export default async function WalletHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Fetch User's Transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5000, // Limit to last 100 for performance
  });

  // 2. Serialize
  const serializedTransactions = transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount.toString(),
    description: tx.description,
    reference: tx.reference,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <CreditCardIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet History</h1>
          <p className="text-sm text-gray-500">Track your deposits, service charges, and refunds.</p>
        </div>
      </div>

      <WalletHistoryClientPage initialTransactions={serializedTransactions} />
    </div>
  );
}
