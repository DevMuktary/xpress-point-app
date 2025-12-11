import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnVerificationClientPage from '@/components/BvnVerificationClientPage';
import SafeImage from '@/components/SafeImage';
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function BvnVerificationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Fetch Services
  const serviceIds = ['BVN_VERIFY_SLIP', 'BVN_VERIFY_PREMIUM'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, isActive: true }
  });

  // 2. Check Availability
  const allDown = services.length > 0 && services.every(s => !s.isActive);
  if (allDown) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
              <ChevronLeftIcon className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">BVN Verification</h1>
        </div>
        <ServiceUnavailable message="BVN Verification services are temporarily unavailable." />
      </div>
    );
  }

  // 3. Build Price & Availability Map
  const prices: Record<string, number> = {};
  const availability: Record<string, boolean> = {};

  services.forEach(s => {
    prices[s.id] = s.defaultAgentPrice.toNumber();
    availability[s.id] = s.isActive;
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
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
          BVN Verification Slip
        </h1>
      </div>
      
      <BvnVerificationClientPage prices={prices} availability={availability} />
    </div>
  );
}
