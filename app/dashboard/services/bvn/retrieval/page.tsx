import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnRetrievalClientPage from '@/components/BvnRetrievalClientPage';
import SafeImage from '@/components/SafeImage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function BvnRetrievalPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 2. Define IDs and Fetch Data (Price + Availability)
  const serviceIds = ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'];
  
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, isActive: true }
  });

  // 3. Global Unavailability Check
  // If we found no services, or ALL found services are inactive
  const allServicesDown = services.length > 0 && services.every(s => !s.isActive);

  if (allServicesDown) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">BVN Retrieval</h1>
        </div>
        <ServiceUnavailable message="All BVN Retrieval services are currently undergoing maintenance. Please check back later." />
      </div>
    );
  }

  // 4. Create Maps
  const priceMap: { [key: string]: number } = {};
  const availabilityMap: { [key: string]: boolean } = {};

  services.forEach(service => {
    priceMap[service.id] = service.defaultAgentPrice.toNumber();
    availabilityMap[service.id] = service.isActive;
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
          BVN Retrieval
        </h1>
      </div>
       
      {/* 5. Pass both maps to the client */}
      <BvnRetrievalClientPage prices={priceMap} availability={availabilityMap} />
    </div>
  );
}
