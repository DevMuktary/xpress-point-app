import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminTransactionsClientPage from '@/components/AdminTransactionsClientPage';

export default async function AdminTransactionsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch Last 100 Transactions (Global)
  const transactions = await prisma.transaction.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      },
      service: {
        select: { name: true }
      }
    }
  });

  // 2. Serialize Decimal and Date
  const serializedTransactions = transactions.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount.toString(),
    description: tx.description,
    reference: tx.reference,
    status: tx.status,
    createdAt: tx.createdAt.toISOString(),
    user: tx.user,
    serviceName: tx.service?.name || null
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
          <DocumentTextIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Log</h1>
          <p className="text-sm text-gray-500">View all financial activities across the platform.</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminTransactionsClientPage initialTransactions={serializedTransactions} />
    </div>
  );
}
