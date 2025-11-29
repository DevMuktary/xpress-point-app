import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NecoPinClientPage from '@/components/NecoPinClientPage';
import SafeImage from '@/components/SafeImage';

export default async function NecoPinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const SERVICE_ID = "NECO_PIN";
  const service = await prisma.service.findUnique({ where: { id: SERVICE_ID } });
  if (!service) {
    throw new Error("NECO_PIN service not found.");
  }

  // --- Get Fee & Status ---
  const serviceFee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;
  // -----------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/neco.png"
          alt="NECO Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          NECO Result Pin
        </h1>
      </div>
      {/* Pass isActive to the client */}
      <NecoPinClientPage serviceId={SERVICE_ID} serviceFee={serviceFee} isActive={isActive} />
    </div>
  );
}
