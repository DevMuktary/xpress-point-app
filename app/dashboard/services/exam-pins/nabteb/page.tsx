import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NabtebPinClientPage from '@/components/NabtebPinClientPage'; // We will create this next
import SafeImage from '@/components/SafeImage';

// This is now a "world-class" Server Component
export default async function NabtebPinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- THIS IS THE "WORLD-CLASS" FIX ---
  const SERVICE_ID = "NABTEB_PIN";
  const service = await prisma.service.findUnique({ where: { id: SERVICE_ID } });

  if (!service) {
    throw new Error("NABTEB_PIN service not found.");
  }

  // "Refurbished" to use the correct pricing logic
  const serviceFee = user.role === 'AGGREGATOR' 
    ? service.platformPrice.toNumber() 
    : service.defaultAgentPrice.toNumber();
  // ------------------------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/nabteb.png"
          alt="NABTEB Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          NABTEB Result Pin
        </h1>
      </div>
      
      {/* We pass the "world-class" price to the client */}
      <NabtebPinClientPage serviceId={SERVICE_ID} serviceFee={serviceFee} />
    </div>
  );
}
