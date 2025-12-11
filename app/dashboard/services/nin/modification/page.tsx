import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinModificationClientPage from '@/components/NinModificationClientPage';
import SafeImage from '@/components/SafeImage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

// This is a Server Component.
export default async function NinModificationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- 1. Get prices and status for these services ---
  const serviceIds = ['NIN_MOD_NAME', 'NIN_MOD_DOB', 'NIN_MOD_PHONE', 'NIN_MOD_ADDRESS'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, isActive: true }
  });

  // --- 2. Global Unavailability Check ---
  // If we found no services, or ALL found services are inactive
  const allServicesDown = services.length > 0 && services.every(s => !s.isActive);

  if (allServicesDown) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">NIN Modification</h1>
        </div>
        <ServiceUnavailable message="All NIN Modification services are currently undergoing maintenance. Please check back later." />
      </div>
    );
  }

  // --- 3. Create Price and Availability Maps ---
  const priceMap: { [key: string]: number } = {};
  const availabilityMap: { [key: string]: boolean } = {};

  services.forEach(service => {
    priceMap[service.id] = service.defaultAgentPrice.toNumber();
    availabilityMap[service.id] = service.isActive;
  });

  // 4. Get the user's consent status
  const hasAgreed = user.hasAgreedToModificationTerms;

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
          NIN Modification
        </h1>
      </div>
      
      {/* 5. Pass props to the Client Component */}
      <NinModificationClientPage 
        hasAlreadyAgreed={hasAgreed} 
        prices={priceMap} 
        availability={availabilityMap}
      />
    </div>
  );
}
