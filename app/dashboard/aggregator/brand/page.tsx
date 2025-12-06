import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, LinkIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AggregatorBrandClientPage from '@/components/AggregatorBrandClientPage';

// This is a Server Component
export default async function AggregatorBrandPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  const { subdomain, businessName, id: aggregatorId } = user;

  // 1. Fetch all active services
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      defaultCommission: true
    },
    orderBy: { category: 'asc' } // Sort by category for better organization
  });

  // 2. Fetch aggregator-specific overrides
  const aggregatorPrices = await prisma.aggregatorPrice.findMany({
    where: { aggregatorId: aggregatorId },
    select: {
      serviceId: true,
      commission: true
    }
  });

  // Create a map for quick lookup of overrides
  const priceMap = new Map(aggregatorPrices.map(p => [p.serviceId, p.commission]));

  // 3. Merge data to calculate actual earnings
  const earningsData = services
    .map(service => {
      // If there is an override, use it; otherwise use default commission
      const commissionDecimal = priceMap.get(service.id) ?? service.defaultCommission;
      
      return {
        service: service.name,
        category: service.category,
        amount: commissionDecimal.toNumber()
      };
    })
    .filter(item => {
      // 4. Hide "Aggregator Upgrade Fee" or any system fees with 0 commission if preferred
      // Explicitly hiding the upgrade fee as requested
      return item.service !== 'Aggregator Upgrade Fee';
    });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/aggregator" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <LinkIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          My Brand & Referral Link
        </h1>
      </div>
      
      {/* 5. Pass the dynamic data to the client component */}
      <AggregatorBrandClientPage 
        subdomain={subdomain || ''} 
        businessName={businessName || ''}
        earningsData={earningsData}
      />
    </div>
  );
}
