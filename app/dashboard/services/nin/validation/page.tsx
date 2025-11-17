import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'; // Changed icon
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinValidationClientPage from '@/components/NinValidationClientPage';
import SafeImage from '@/components/SafeImage';

// This is a Server Component. It fetches data on the server.
export default async function NinValidationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- THIS IS THE FIX (Part 1) ---
  // 1. Get the prices for this service
  const serviceIds = ['NIN_VALIDATION_47', 'NIN_VALIDATION_48', 'NIN_VALIDATION_49', 'NIN_VALIDATION_50'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true }
  });

  // 2. Create the Price Map for the client
  const priceMap: { [key: string]: number } = {};
  services.forEach(service => {
    // All users see the 'defaultAgentPrice'
    priceMap[service.id] = service.defaultAgentPrice.toNumber();
  });
  // ------------------------------------

  // 3. Get the user's existing requests from our database
  const requests = await prisma.validationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }, // Show newest first
  });

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
          NIN Validation
        </h1>
      </div>
      
      {/* 4. Pass the requests AND the prices to the Client Component */}
      <NinValidationClientPage 
        initialRequests={requests} 
        prices={priceMap}
      />
    </div>
  );
}
