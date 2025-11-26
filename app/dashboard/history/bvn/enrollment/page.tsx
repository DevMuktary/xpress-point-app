import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnEnrollmentHistoryClientPage from '@/components/BvnEnrollmentHistoryClientPage';

export default async function BvnEnrollmentHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // Fetch Android Enrollment Requests
  const requests = await prisma.bvnRequest.findMany({
    where: {
      userId: user.id,
      serviceId: 'BVN_ENROLLMENT_ANDROID'
    },
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
    createdAt: req.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
          <DevicePhoneMobileIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Android Enrollment History</h1>
          <p className="text-sm text-gray-500">Track your enrollment user setup requests.</p>
        </div>
      </div>
      
      <BvnEnrollmentHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}
