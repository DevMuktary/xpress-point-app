import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ModificationHistoryClientPage from '@/components/ModificationHistoryClientPage';

export default async function ModificationHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Fetch Requests
  const requests = await prisma.modificationRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      service: {
        select: { name: true }
      }
    }
  });

  // 2. Serialize for Client
  const serializedRequests = requests.map(req => ({
    id: req.id,
    serviceName: req.service.name,
    status: req.status,
    statusMessage: req.statusMessage,
    formData: req.formData, // This contains the resultUrl
    createdAt: req.createdAt.toISOString(),
    uploadedSlipUrl: req.uploadedSlipUrl, // Included for reference, but NOT for result
    attestationUrl: req.attestationUrl    // Included for reference
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <ClockIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Modification History
        </h1>
      </div>
      
      {/* Client Component */}
      <ModificationHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}
