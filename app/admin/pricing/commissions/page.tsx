import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminCommissionClientPage from '@/components/AdminCommissionClientPage';

export default async function AdminCommissionPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch all Services with their current global commission
  const services = await prisma.service.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' }
    ],
    select: { 
      id: true, 
      name: true, 
      category: true,
      defaultCommission: true // Fetch the new field
    } 
  });

  // 2. Serialize Decimal to String for Client Component
  const serializedServices = services.map(s => ({
    ...s,
    aggregatorCommission: s.aggregatorCommission.toString()
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <ShieldCheckIcon className="h-8 w-8 text-gray-900" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Commissions</h1>
          <p className="text-sm text-gray-500">Set the commission aggregators earn when their agents perform these services.</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminCommissionClientPage services={serializedServices} />
    </div>
  );
}
