import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ValidationClientPage from '@/components/ValidationClientPage'; // We will create this next

// This is a Server Component. It fetches data on the server.
export default async function NinValidationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login');
  }

  // 1. Get the user's existing requests from our database
  const requests = await prisma.validationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }, // Show newest first
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/nin.png"
          alt="NIN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Validation
        </h1>
      </div>
      
      {/* 2. Pass the requests (from the server) to the 
           interactive Client Component, which will handle the rest.
      */}
      <ValidationClientPage initialRequests={requests} />
    </div>
  );
}
