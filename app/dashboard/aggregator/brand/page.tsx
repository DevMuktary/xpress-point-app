import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, LinkIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AggregatorBrandClientPage from '@/components/AggregatorBrandClientPage'; // We will create this next

// This is a "world-class" Server Component
export default async function AggregatorBrandPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'AGGREGATOR') {
    redirect('/dashboard');
  }

  // 1. "Fetch" the Aggregator's "stunning" brand info
  const { subdomain, businessName } = user;

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
      
      {/* 2. Pass the "world-class" data to the client */}
      <AggregatorBrandClientPage 
        subdomain={subdomain || ''} 
        businessName={businessName || ''}
      />
    </div>
  );
}
