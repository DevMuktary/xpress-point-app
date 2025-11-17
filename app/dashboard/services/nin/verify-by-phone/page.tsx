import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerifyByPhoneClientPage from '@/components/VerifyByPhoneClientPage'; // We will create this

export default async function VerifyByPhonePage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the price for this service (it's the same as NIN_LOOKUP)
  const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
  if (!service) {
    throw new Error("NIN_LOOKUP service not found.");
  }

  // 2. All users see the 'defaultAgentPrice'
  const serviceFee = service.defaultAgentPrice.toNumber();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Verify by Phone</h1>
        </div>
      </div>
      
      {/* 3. Pass the price to the Client Component */}
      <VerifyByPhoneClientPage serviceFee={serviceFee} />
    </div>
  );
}
