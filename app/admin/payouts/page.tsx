import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminPayoutsClientPage from '@/components/AdminPayoutsClientPage';

export default async function AdminPayoutsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch Pending Payouts
  const pendingPayouts = await prisma.withdrawalRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, bankName: true, accountNumber: true, accountName: true } }
    }
  });

  // 2. Fetch Payout History (Completed/Failed)
  const payoutHistory = await prisma.withdrawalRequest.findMany({
    where: { status: { not: 'PENDING' } },
    // FIX: Used 'createdAt' because 'updatedAt' does not exist on this model
    orderBy: { createdAt: 'desc' }, 
    take: 50,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  // 3. Fetch Account Change Requests
  const accountChanges = await prisma.pendingAccountChange.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  });

  // Serialize
  const serializedPending = pendingPayouts.map(p => ({
    ...p,
    amount: p.amount.toString(),
    createdAt: p.createdAt.toISOString()
  }));

  const serializedHistory = payoutHistory.map(p => ({
    ...p,
    amount: p.amount.toString(),
    // We use createdAt here too since we sorted by it
    updatedAt: p.createdAt.toISOString() 
  }));

  const serializedChanges = accountChanges.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString()
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <BanknotesIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Requests</h1>
          <p className="text-sm text-gray-500">Manage payouts and account updates.</p>
        </div>
      </div>

      <AdminPayoutsClientPage 
        initialPayouts={serializedPending} 
        payoutHistory={serializedHistory}
        accountChanges={serializedChanges}
      />
    </div>
  );
}
