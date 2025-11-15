import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnModificationClientPage from '@/components/BvnModificationClientPage'; // We will create this next
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default async function BvnModificationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get all 6 of the BVN Mod prices from our database
  const serviceIds = [
    'BVN_MOD_NAME', 'BVN_MOD_DOB', 'BVN_MOD_PHONE',
    'BVN_MOD_NAME_DOB', 'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE'
  ];
  
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true, platformPrice: true }
  });

  // 2. Create the Price Map for the client
  const priceMap: { [key: string]: number } = {};
  services.forEach(service => {
    priceMap[service.id] = (user.role === 'AGGREGATOR' 
      ? service.platformPrice 
      : service.defaultAgentPrice
    ).toNumber();
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
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
          BVN Modification
        </h1>
      </div>
      
      {/* 3. Pass the prices to the Client Component */}
      <BvnModificationClientPage prices={priceMap} />
    </div>
  );
}
