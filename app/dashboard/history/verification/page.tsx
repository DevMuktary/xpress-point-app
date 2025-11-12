import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerificationHistoryClientPage from '@/components/VerificationHistoryClientPage'; // We will create this next

// This is a Server Component. It fetches data on the server.
export default async function NinVerificationHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the user's existing requests from our database
  // "World-class" logic: only get requests from the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const requests = await prisma.ninVerification.findMany({
    where: { 
      userId: user.id,
      createdAt: {
        gte: twentyFourHoursAgo // "gte" = Greater Than or Equal to
      }
    },
    orderBy: { createdAt: 'desc' }, // Show newest first
    select: {
      id: true,
      createdAt: true,
      data: true, // We need the full data to show the name
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <DocumentMagnifyingGlassIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Verification History
        </h1>
      </div>
      
      {/* 2. Pass the requests (from the server) to the 
           interactive Client Component, which will handle the rest.
      */}
      <VerificationHistoryClientPage initialRequests={requests} />
    </div>
  );
}
