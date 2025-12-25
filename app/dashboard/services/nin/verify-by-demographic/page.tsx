import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerifyByDemographicClientPage from '@/components/VerifyByDemographicClientPage';
import SafeImage from '@/components/SafeImage';

export default async function VerifyByDemographicPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // Get price and status from NIN_LOOKUP service
  const service = await prisma.service.findUnique({ where: { id: 'NIN_LOOKUP' } });
  if (!service) {
    throw new Error("NIN_LOOKUP service not found.");
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <VerifyByDemographicClientPage 
        serviceFee={service.defaultAgentPrice.toNumber()} 
        isActive={service.isActive} 
      />
    </div>
  );
}
