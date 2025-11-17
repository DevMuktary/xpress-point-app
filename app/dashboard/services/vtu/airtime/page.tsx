import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AirtimeClientPage from '@/components/AirtimeClientPage'; // We will create this next
import SafeImage from '@/components/SafeImage';

// This is now a Server Component.
export default async function AirtimePage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get all 4 Airtime services from the database
  const serviceIds = ['AIRTIME_MTN', 'AIRTIME_GLO', 'AIRTIME_AIRTEL', 'AIRTIME_9MOBILE'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, platformPrice: true }
  });

  // 2. Create the Price Map for the client
  const priceMap: { [key: string]: number } = {};
  services.forEach(service => {
    // All users see the 'defaultAgentPrice'
    priceMap[service.id] = service.defaultAgentPrice.toNumber();
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/vtu" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <PhoneIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Buy Airtime
        </h1>
      </div>
      
      {/* 3. Pass the prices to the Client Component */}
      <AirtimeClientPage prices={priceMap} />
    </div>
  );
}
