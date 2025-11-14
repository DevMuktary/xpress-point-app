import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import WaecPinClientPage from '@/components/WaecPinClientPage'; // This component is already correct
import SafeImage from '@/components/SafeImage';

// This is a Server Component. It fetches data on the server.
export default async function WaecPinPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- 1. Define the Service ID ---
  const SERVICE_ID = "WAEC_PIN";

  // --- 2. Get the "world-class" price from the database ---
  const service = await prisma.service.findUnique({
    where: { id: SERVICE_ID },
  });

  if (!service) {
    // This should not happen if the seed is correct
    throw new Error("WAEC_PIN service not found in database.");
  }

  // --- THIS IS THE "WORLD-CLASS" FIX ---
  // We now use the "refurbished" price fields: platformPrice and defaultAgentPrice
  const serviceFee = user.role === 'AGGREGATOR' 
    ? service.platformPrice.toNumber() 
    : service.defaultAgentPrice.toNumber();
  // ------------------------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/exam-pins" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/waec.png"
          alt="WAEC Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          WAEC Result Pin
        </h1>
      </div>
      
      {/* 4. Pass the price to the Client Component */}
      <WaecPinClientPage 
        serviceId={SERVICE_ID} 
        serviceFee={serviceFee} 
      />
    </div>
  );
}
