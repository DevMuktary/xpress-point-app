import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline'; 
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import DelinkClientPage from '@/components/DelinkClientPage';
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default async function NinDelinkPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- THIS IS THE FIX ---
  // 1. Get the price and status for this service
  const service = await prisma.service.findUnique({ where: { id: 'NIN_DELINK' } });
  if (!service) {
    throw new Error("NIN_DELINK service not found.");
  }

  // 2. Get Fee & Active Status
  const serviceFee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;
  // -----------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
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
          NIN Delink / Retrieve Email
        </h1>
      </div>
      
      {/* 3. Pass props to the Client Component */}
      <DelinkClientPage serviceFee={serviceFee} isActive={isActive} />
    </div>
  );
}
