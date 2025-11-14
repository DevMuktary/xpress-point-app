import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, WifiIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VtuHistoryClientPage from '@/components/VtuHistoryClientPage'; // We re-use our "world-class" component

// This is a Server Component.
export default async function DataHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get the user's "world-class" requests
  const requests = await prisma.vtuRequest.findMany({
    where: { 
      userId: user.id,
      service: {
        category: 'VTU_DATA' // <-- "Refurbished" for Data
      }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      service: {
        select: { name: true }
      }
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history/vtu" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <WifiIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Data History
        </h1>
      </div>
      
      {/* 2. Pass the requests to the "stunning" Client Component */}
      <VtuHistoryClientPage 
        initialRequests={requests} 
        category="Data" 
        searchPlaceholder="Search by Phone Number..."
      />
    </div>
  );
}
