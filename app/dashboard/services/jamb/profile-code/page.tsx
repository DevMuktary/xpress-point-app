import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // Import Prisma
import JambProfileCodeClientPage from '@/components/JambProfileCodeClientPage';
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default async function JambProfileCodePage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- Fetch Service Data ---
  const SERVICE_ID = 'JAMB_PROFILE_CODE';
  const service = await prisma.service.findUnique({
    where: { id: SERVICE_ID },
  });

  if (!service) {
    // Ideally handle this gracefully, but for now throw error or redirect
    throw new Error(`Service ${SERVICE_ID} not found.`);
  }

  const fee = service.defaultAgentPrice.toNumber();
  const isActive = service.isActive;
  // --------------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/jamb" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/jamb.png"
          alt="JAMB Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          JAMB Profile Code Retrieval
        </h1>
      </div>
      
      {/* --- Render Client Component with Dynamic Props --- */}
      <JambProfileCodeClientPage fee={fee} isActive={isActive} />
    </div>
  );
}
