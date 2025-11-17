import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinValidationClientPage from '@/components/NinValidationClientPage';

export default async function NinValidationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const serviceIds = ['NIN_VALIDATION_47', 'NIN_VALIDATION_48', 'NIN_VALIDATION_49', 'NIN_VALIDATION_50'];
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
        <CheckBadgeIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Validation (S-Code)
        </h1>
      </div>
      <NinValidationClientPage prices={priceMap} />
    </div>
  );
}
