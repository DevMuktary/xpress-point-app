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

  // 1. Fetch Pending Payouts (Include User info for Bank Details)
  const pendingPayouts = await prisma.withdrawalRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' }, // Oldest first
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          bankName: true,
          accountNumber: true,
          accountName: true
        }
      }
    }
  });

  // 2. Serialize Decimals
  const serializedPayouts = pendingPayouts.map(p => ({
    ...p,
    amount: p.amount.toString(),
    user: p.user
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <BanknotesIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payout Requests</h1>
          <p className="text-sm text-gray-500">Manage and process aggregator withdrawals.</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminPayoutsClientPage initialPayouts={serializedPayouts} />
    </div>
  );
}
