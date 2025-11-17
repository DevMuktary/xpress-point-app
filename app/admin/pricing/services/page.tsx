import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminServicePricingClientPage from '@/components/AdminServicePricingClientPage';

// This is a Server Component.
export default async function AdminServicePricingPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Get ALL services from the database
  const services = await prisma.service.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ]
  });

  // --- THIS IS THE FIX ---
  // We must serialize the Decimal objects to strings before sending them
  // to the client component, as they cannot be passed as props.
  const serializedServices = services.map(service => ({
    ...service,
    platformPrice: service.platformPrice.toString(),
    defaultAgentPrice: service.defaultAgentPrice.toString(),
  }));
  // -----------------------

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <CurrencyDollarIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Service Pricing (Agent)
        </h1>
      </div>
      
      {/* 2. Pass the *serialized* services to the Client Component */}
      <AdminServicePricingClientPage initialServices={serializedServices} />
    </div>
  );
}
