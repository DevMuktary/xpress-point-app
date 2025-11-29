import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CacClientPage from '@/components/CacClientPage'; 
import SafeImage from '@/components/SafeImage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function CacServicesPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- 1. Fetch Services from DB ---
  const serviceIds = ['CAC_REG_BN', 'CAC_DOC_RETRIEVAL'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } }
  });

  // --- 2. Check Global Availability ---
  // If we found no services, or ALL found services are inactive
  const allServicesDown = services.length > 0 && services.every(s => !s.isActive);

  if (allServicesDown) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">CAC Services Hub</h1>
        </div>
        <ServiceUnavailable message="All CAC services are currently undergoing maintenance. Please check back later." />
      </div>
    );
  }

  // --- 3. Create Price & Availability Maps ---
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
    <div className="w-full max-w-4xl mx-auto">
      {/* --- Page Header with Logo --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage 
          src="/logos/cac.png" 
          alt="CAC Logo"
          width={48}
          height={48}
          fallbackSrc="/logos/default.png"
          className="rounded-full shadow-sm"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAC Services Hub</h1>
          <p className="text-sm text-gray-500">Business Registration & Document Services</p>
        </div>
      </div>
      
      {/* --- Render the Interactive Client Component --- */}
      <CacClientPage prices={prices} availability={availability} />
    </div>
  );
}
