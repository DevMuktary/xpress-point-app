import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinModificationClientPage from '@/components/NinModificationClientPage';

export default async function NinModificationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const serviceIds = ['NIN_MOD_NAME', 'NIN_MOD_DOB', 'NIN_MOD_PHONE', 'NIN_MOD_ADDRESS'];
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, defaultAgentPrice: true }
  });

  // --- THIS IS THE FIX ---
  const priceMap: { [key: string]: number } = {};
  services.forEach(service => {
    priceMap[service.id] = service.defaultAgentPrice.toNumber();
  });
  // -----------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <PencilSquareIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Modification
        </h1>
      </div>
      <NinModificationClientPage prices={priceMap} />
    </div>
  );
}
