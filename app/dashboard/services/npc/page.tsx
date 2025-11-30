import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NpcAttestationClientPage from '@/components/NpcAttestationClientPage';
import SafeImage from '@/components/SafeImage';
import ServiceUnavailable from '@/components/ServiceUnavailable';

export default async function NpcAttestationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the price and status
  const SERVICE_ID = 'NPC_ATTESTATION';
  const service = await prisma.service.findUnique({ where: { id: SERVICE_ID } });
  
  if (!service) {
    // This handles the case where seed hasn't run yet in dev, though it should exist.
    throw new Error("NPC Service not found. Please run seed.");
  }

  const serviceFee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;

  if (!isActive) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <SafeImage src="/logos/npc.png" alt="NPC Logo" width={40} height={40} className="rounded-full" fallbackSrc="/logos/default.png" />
          <h1 className="text-2xl font-bold text-gray-900">NPC Attestation</h1>
        </div>
        <ServiceUnavailable message="NPC Attestation service is currently undergoing maintenance." />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage src="/logos/npc.png" alt="NPC Logo" width={40} height={40} className="rounded-full" fallbackSrc="/logos/default.png" />
        <h1 className="text-2xl font-bold text-gray-900">NPC Attestation</h1>
      </div>
      
      <NpcAttestationClientPage serviceFee={serviceFee} />
    </div>
  );
}
