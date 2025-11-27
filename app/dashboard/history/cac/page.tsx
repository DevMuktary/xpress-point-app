import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CacHistoryClientPage from '@/components/CacHistoryClientPage';

export default async function CacHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const requests = await prisma.cacRequest.findMany({
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
    formData: req.formData,
    certificateUrl: req.certificateUrl,
    statusReportUrl: req.statusReportUrl,
    createdAt: req.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/cac" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-green-100 rounded-lg text-green-700">
          <BriefcaseIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CAC History</h1>
          <p className="text-sm text-gray-500">Your Business Registrations & Documents.</p>
        </div>
      </div>
      
      <CacHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}

