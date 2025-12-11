import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'; 
import SafeImage from '@/components/SafeImage';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PersonalizationClientPage from '@/components/PersonalizationClientPage'; 

// This is a Server Component. It fetches data on the server.
export default async function PersonalizeNinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- THIS IS THE FIX (Part 1) ---
  // 1. Get the price and status for this service
  const service = await prisma.service.findUnique({ where: { id: 'NIN_PERSONALIZATION' } });
  if (!service) {
    throw new Error("NIN_PERSONALIZATION service not found.");
  }

  // 2. Get Fee & Active Status
  const serviceFee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;
  // ------------------------------------

  // 3. Get the user's existing requests from our database
  const requests = await prisma.personalizationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }, // Show newest first
  });

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
          Personalize NIN (Tracking ID)
        </h1>
      </div>
      
      {/* 4. Pass props to the Client Component */}
      <PersonalizationClientPage 
        initialRequests={requests} 
        serviceFee={serviceFee}
        isActive={isActive}
      />
    </div>
  );
}
