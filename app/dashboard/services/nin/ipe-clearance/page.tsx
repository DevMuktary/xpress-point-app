import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import IpeClearanceClientPage from '@/components/IpeClearanceClientPage';

export default async function IpeClearancePage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const service = await prisma.service.findUnique({ where: { id: 'NIN_IPE_CLEARANCE' } });
  if (!service) {
    throw new Error("NIN_IPE_CLEARANCE service not found.");
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
        <ShieldExclamationIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN IPE Clearance
        </h1>
      </div>
      <IpeClearanceClientPage serviceFee={serviceFee} />
    </div>
  );
}
