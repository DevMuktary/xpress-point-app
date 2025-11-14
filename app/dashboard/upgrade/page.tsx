import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import UpgradeClientPage from '@/components/UpgradeClientPage';
import SafeImage from '@/components/SafeImage';

// This is a "world-class" Server Component
export default async function UpgradePage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // "Stunning" check: If user is ALREADY an Aggregator, redirect them
  if (user.role === 'AGGREGATOR') {
    redirect('/dashboard/aggregator'); // Redirect to their new dashboard
  }

  // --- "World-Class" Price Fetching ---
  const SERVICE_ID = "AGGREGATOR_UPGRADE";
  const service = await prisma.service.findUnique({ where: { id: SERVICE_ID } });

  if (!service) {
    // This should not happen if the seed is correct
    throw new Error("AGGREGATOR_UPGRADE service not found in database.");
  }

  // This is the 5,000 fee
  const upgradeFee = service.defaultAgentPrice.toNumber();
  // ------------------------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Upgrade to Aggregator
        </h1>
      </div>
      
      {/* We pass the "stunning" 5,000 fee to the client */}
      <UpgradeClientPage fee={upgradeFee} />
    </div>
  );
}
