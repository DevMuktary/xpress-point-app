import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CacHistoryClientPage from '@/components/CacHistoryClientPage'; // We will create this next

// This is a Server Component. It fetches data on the server.
export default async function CacHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the user's existing requests from our database
  const requests = await prisma.cacRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }, // Show newest first
    // "World-class" include to get the service name
    include: {
      service: {
        select: {
          name: true
        }
      }
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <BriefcaseIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          CAC History
        </h1>
      </div>
      
      {/* 2. Pass the requests (from the server) to the 
           interactive Client Component, which will handle the rest.
      */}
      <CacHistoryClientPage initialRequests={requests} />
    </div>
  );
}
