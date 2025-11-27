import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnNibssHistoryClientPage from '@/components/BvnNibssHistoryClientPage';

export default async function BvnNibssHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const requests = await prisma.bvnRequest.findMany({
    where: { 
      userId: user.id,
      serviceId: 'BVN_VNIN_TO_NIBSS'
    },
    orderBy: { createdAt: 'desc' }
  });

  const serializedRequests = requests.map(req => ({
    id: req.id,
    status: req.status,
    statusMessage: req.statusMessage,
    formData: req.formData,
    createdAt: req.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <GlobeAltIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">VNIN to NIBSS History</h1>
      </div>
      
      <BvnNibssHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}
