import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnHistoryClientPage from '@/components/BvnHistoryClientPage';

export default async function BvnHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const requests = await prisma.bvnRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { name: true } }
    }
  });

  const serializedRequests = requests.map(req => ({
    id: req.id,
    serviceName: req.service.name,
    status: req.status,
    statusMessage: req.statusMessage,
    retrievalResult: req.retrievalResult, // The text BVN
    formData: req.formData, // Contains optional admin file
    createdAt: req.createdAt.toISOString(),
    // For display context:
    phone: (req.formData as any)?.phone || null,
    name: (req.formData as any)?.fullName || (req.formData as any)?.firstName || null
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <ClockIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">BVN History</h1>
      </div>
      
      <BvnHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}
