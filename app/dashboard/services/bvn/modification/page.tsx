import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnModificationClientPage from '@/components/BvnModificationClientPage';
import SafeImage from '@/components/SafeImage';

export default async function BvnModificationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const serviceIds = [
    'BVN_MOD_NAME', 'BVN_MOD_DOB', 'BVN_MOD_PHONE',
    'BVN_MOD_NAME_DOB', 'BVN_MOD_NAME_PHONE', 'BVN_MOD_DOB_PHONE'
  ];
  
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { 
      id: true, 
      defaultAgentPrice: true,
      isActive: true // <--- Fetch Availability
    }
  });

  // Create Price Map AND Availability Map
  const priceMap: { [key: string]: number } = {};
  const availabilityMap: { [key: string]: boolean } = {};

  services.forEach(service => {
    priceMap[service.id] = service.defaultAgentPrice.toNumber();
    availabilityMap[service.id] = service.isActive;
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
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

      {/* Pass Availability Map to Client */}
      <BvnModificationClientPage 
        prices={priceMap} 
        availability={availabilityMap}
        hasAlreadyAgreed={user.hasAgreedToModificationTerms}
      />
    </div>
  );
}
