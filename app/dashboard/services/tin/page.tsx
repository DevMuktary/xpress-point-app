import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TinClientPage from '@/components/TinClientPage'; 
import SafeImage from '@/components/SafeImage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function JtbTinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- 1. Fetch Real Prices from DB ---
  const serviceIds = [
    'TIN_REG_PERSONAL', 
    'TIN_REG_BUSINESS', 
    'TIN_RETRIEVAL_PERSONAL', 
    'TIN_RETRIEVAL_BUSINESS'
  ];
  
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, isActive: true }
  });

  // --- 2. Check Global Availability ---
  // If we found no services, or ALL found services are inactive
  const allServicesDown = services.length > 0 && services.every(s => !s.isActive);

  if (allServicesDown) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">JTB-TIN Services</h1>
        </div>
        <ServiceUnavailable message="All JTB-TIN services are currently undergoing maintenance. Please check back later." />
      </div>
    );
  }

  // --- 3. Create Maps ---
  const prices: Record<string, number> = {};
  const availability: Record<string, boolean> = {};
  
  serviceIds.forEach(id => {
    const service = services.find(s => s.id === id);
    if (service) {
      prices[id] = Number(service.defaultAgentPrice);
      availability[id] = service.isActive;
    } else {
      prices[id] = 0; 
      availability[id] = false;
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header with Logo --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/tin.png"
          alt="TIN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full shadow-sm"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          JTB-TIN Services
        </h1>
      </div>
      
      {/* --- Render the Interactive Client Component --- */}
      <TinClientPage prices={prices} availability={availability} />
    </div>
  );
}
