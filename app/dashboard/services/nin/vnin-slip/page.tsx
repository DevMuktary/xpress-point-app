import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VninSlipClientPage from '@/components/VninSlipClientPage';
import SafeImage from '@/components/SafeImage';

export default async function VninSlipPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Fetch Service Data
  const SERVICE_ID = 'VNIN_SLIP';
  const service = await prisma.service.findUnique({
    where: { id: SERVICE_ID },
  });

  if (!service) {
    // Ensure you ran the seed or manually added this service
    throw new Error(`Service ${SERVICE_ID} not found.`);
  }

  const fee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/nin.png"
          alt="NIN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          VNIN Slip (Instant)
        </h1>
      </div>
      
      {/* --- Client Component --- */}
      <VninSlipClientPage fee={fee} isActive={isActive} />
    </div>
  );
}
