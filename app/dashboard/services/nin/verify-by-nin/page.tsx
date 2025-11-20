import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerifyByNinClientPage from '@/components/VerifyByNinClientPage';
import SafeImage from '@/components/SafeImage';

export default async function VerifyByNinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the price for this service
  const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
  if (!service) {
    throw new Error("NIN_LOOKUP service not found.");
  }

  // 2. All users see the 'defaultAgentPrice'
  const serviceFee = service.defaultAgentPrice.toNumber();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        {/* Added the Logo for consistency */}
        <SafeImage
          src="/logos/nin.png"
          alt="NIN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">Verify by NIN</h1>
      </div>
      
      {/* 3. Pass the price to the Client Component */}
      <VerifyByNinClientPage serviceFee={serviceFee} />
    </div>
  );
}
