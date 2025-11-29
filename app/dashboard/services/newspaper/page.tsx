import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Import Prisma
import NewspaperClientPage from '@/components/NewspaperClientPage';
import ServiceUnavailable from '@/components/ServiceUnavailable';

// This is a Server Component.
export default async function NewspaperPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- Fetch Service Data ---
  const SERVICE_ID = 'NEWSPAPER_NAME_CHANGE';
  const service = await prisma.service.findUnique({
    where: { id: SERVICE_ID },
  });

  if (!service) {
    // Graceful error handling in production
    throw new Error(`Service ${SERVICE_ID} not found.`);
  }

  const fee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;
  // --------------------------

  // --- Global Availability Check ---
  if (!isActive) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <NewspaperIcon className="h-8 w-8 text-gray-900" />
          <h1 className="text-2xl font-bold text-gray-900">Newspaper Publication</h1>
        </div>
        <ServiceUnavailable message="Newspaper Publication services are currently undergoing maintenance. Please check back later." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <NewspaperIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Newspaper Publication
        </h1>
      </div>
      
      {/* --- Render the Client Component with Dynamic Fee --- */}
      <NewspaperClientPage fee={fee} />
    </div>
  );
}
