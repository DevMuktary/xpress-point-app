import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NpcHistoryClientPage from '@/components/NpcHistoryClientPage';

export default async function NpcHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const requests = await prisma.npcRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <ClockIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">NPC Attestation History</h1>
      </div>
      <NpcHistoryClientPage initialRequests={requests} />
    </div>
  );
}
