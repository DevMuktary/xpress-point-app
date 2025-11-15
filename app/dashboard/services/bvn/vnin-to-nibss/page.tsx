import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, LinkIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VninToNibssClientPage from '@/components/VninToNibssClientPage'; // We will create this next
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default async function VninToNibssPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the price for this service
  const service = await prisma.service.findUnique({
    where: { id: 'BVN_VNIN_TO_NIBSS' },
  });

  if (!service) {
    throw new Error("BVN_VNIN_TO_NIBSS service not found.");
  }

  // 2. Determine the correct price
  const serviceFee = user.role === 'AGGREGATOR' 
    ? service.platformPrice.toNumber() 
    : service.defaultAgentPrice.toNumber();

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
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
          VNIN to NIBSS
        </h1>
      </div>
      
      {/* 3. Pass the price to the Client Component */}
      <VninToNibssClientPage fee={serviceFee} />
    </div>
  );
}
