import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ResultRequestClientPage from '@/components/ResultRequestClientPage';
// 1. Import the Unavailable Component
import ServiceUnavailable from '@/components/ServiceUnavailable';

// This is a Server Component.
export default async function RequestResultPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the user's existing requests from our database
  const requests = await prisma.resultRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      service: {
        select: {
          name: true
        }
      }
    }
  });

  // 2. Fetch Availability Status for the 3 Services
  const serviceIds = ['RESULT_REQUEST_WAEC', 'RESULT_REQUEST_NECO', 'RESULT_REQUEST_NABTEB'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, isActive: true }
  });

  // 3. Global Unavailability Check
  // If we found no services, or ALL found services are inactive
  const allServicesDown = services.length > 0 && services.every(s => !s.isActive);

  if (allServicesDown) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <DocumentMagnifyingGlassIcon className="h-8 w-8 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">Request Result</h1>
        </div>
        <ServiceUnavailable message="All Result Checker services are currently undergoing maintenance. Please check back later." />
      </div>
    );
  }

  // 4. Create Availability Map
  const availabilityMap: { [key: string]: boolean } = {};
  // Default all to false first, then enable found ones
  serviceIds.forEach(id => availabilityMap[id] = false);
  
  services.forEach(service => {
    availabilityMap[service.id] = service.isActive;
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <DocumentMagnifyingGlassIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Request Result
        </h1>
      </div>
      
      {/* 5. Pass availability to the Client Component */}
      <ResultRequestClientPage initialRequests={requests} availability={availabilityMap} />
    </div>
  );
}
