import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnRetrievalClientPage from '@/components/BvnRetrievalClientPage';
import SafeImage from '@/components/SafeImage';

export default async function BvnRetrievalPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- THIS IS THE FIX (Part 1) ---
  // Fetch prices from the database
  const [phoneService, crmService] = await Promise.all([
    prisma.service.findUnique({ where: { id: 'BVN_RETRIEVAL_PHONE' } }),
    prisma.service.findUnique({ where: { id: 'BVN_RETRIEVAL_CRM' } })
  ]);

  if (!phoneService || !crmService) {
    throw new Error("BVN Retrieval services not found.");
  }

  // Use the correct variables we fetched
  const priceMap = {
    BVN_RETRIEVAL_PHONE: phoneService.defaultAgentPrice.toNumber(),
    BVN_RETRIEVAL_CRM: crmService.defaultAgentPrice.toNumber()
  };
  // -----------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/bvn.png"
          alt="BVN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          BVN Retrieval
        </h1>
      </div>
      
      {/* Pass the prices to the client */}
      <BvnRetrievalClientPage prices={priceMap} />
    </div>
  );
}
