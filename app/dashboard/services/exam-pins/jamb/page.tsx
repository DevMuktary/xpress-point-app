import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import JambPinClientPage from '@/components/JambPinClientPage';
import SafeImage from '@/components/SafeImage';

export default async function JambPinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get BOTH prices from the database
  const [utmeService, deService] = await Promise.all([
    prisma.service.findUnique({ where: { id: 'JAMB_UTME_PIN' } }),
    prisma.service.findUnique({ where: { id: 'JAMB_DE_PIN' } }),
  ]);

  if (!utmeService || !deService) {
    throw new Error("JAMB services not found.");
  }

  // --- THIS IS THE "WORLD-CLASS" FIX ---
  // We now use the "refurbished" price fields: platformPrice and defaultAgentPrice
  const utmeFee = user.role === 'AGGREGATOR' 
    ? utmeService.platformPrice.toNumber() 
    : utmeService.defaultAgentPrice.toNumber();
    
  const deFee = user.role === 'AGGREGATOR' 
    ? deService.platformPrice.toNumber() 
    : deService.defaultAgentPrice.toNumber();
  // ------------------------------------

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
      
      {/* We pass the correct, "world-class" prices to the client */}
      <JambPinClientPage utmeFee={utmeFee} deFee={deFee} />
    </div>
  );
}
