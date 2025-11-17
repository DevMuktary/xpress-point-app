import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinPersonalizationClientPage from '@/components/NinPersonalizationClientPage';

export default async function NinPersonalizationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const service = await prisma.service.findUnique({ where: { id: 'NIN_PERSONALIZATION' } });
  if (!service) {
    throw new Error("NIN_PERSONALIZATION service not found.");
  }

  // --- THIS IS THE FIX ---
  const serviceFee = service.defaultAgentPrice.toNumber();
  // -----------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <UserCircleIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Personalization
        </h1>
      </div>
      <NinPersonalizationClientPage serviceFee={serviceFee} />
    </div>
  );
}
