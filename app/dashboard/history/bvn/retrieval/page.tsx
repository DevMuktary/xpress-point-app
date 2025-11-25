import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnRetrievalHistoryClientPage from '@/components/BvnRetrievalHistoryClientPage';

export default async function BvnRetrievalHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Fetch ONLY Retrieval Requests (Phone & CRM)
  const requests = await prisma.bvnRequest.findMany({
    where: { 
      userId: user.id,
      serviceId: { in: ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'] }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { name: true } }
    }
  });

  // 2. Serialize Data
  const serializedRequests = requests.map(req => ({
    id: req.id,
    serviceName: req.service.name,
    status: req.status,
    statusMessage: req.statusMessage,
    retrievalResult: req.retrievalResult, // This holds the BVN number
    formData: req.formData, // Contains input details and optional admin file
    createdAt: req.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
          <MagnifyingGlassIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BVN Retrieval History</h1>
          <p className="text-sm text-gray-500">View your Phone and CRM retrieval results.</p>
        </div>
      </div>
      
      <BvnRetrievalHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}
