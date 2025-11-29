import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JambPinClientPage from '@/components/JambPinClientPage';
import SafeImage from '@/components/SafeImage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function JambPinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const [utmeService, deService] = await Promise.all([
    prisma.service.findUnique({ where: { id: 'JAMB_UTME_PIN' } }),
    prisma.service.findUnique({ where: { id: 'JAMB_DE_PIN' } }),
  ]);
  
  if (!utmeService || !deService) {
    throw new Error("JAMB services not found.");
  }

  // --- 2. Check Availability ---
  const utmeActive = utmeService.isActive;
  const deActive = deService.isActive;

  // If BOTH services are down, show global maintenance message
  if (!utmeActive && !deActive) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">JAMB PINs</h1>
        </div>
        <ServiceUnavailable message="JAMB PIN services (UTME & DE) are currently unavailable. Please check back later." />
      </div>
    );
  }

  // --- 3. Get Fees ---
  const utmeFee = utmeService.defaultAgentPrice.toNumber();
  const deFee = deService.defaultAgentPrice.toNumber();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/jamb.png"
          alt="JAMB Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          JAMB PINs
        </h1>
      </div>
      
      {/* 4. Pass fees AND availability to client */}
      <JambPinClientPage 
        utmeFee={utmeFee} 
        deFee={deFee} 
        utmeActive={utmeActive}
        deActive={deActive}
      />
    </div>
  );
}
