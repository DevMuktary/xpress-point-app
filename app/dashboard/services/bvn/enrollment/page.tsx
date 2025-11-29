import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnEnrollmentClientPage from '@/components/BvnEnrollmentClientPage';

export default async function BvnEnrollmentPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // 1. Get Service Price & Availability
  const serviceId = 'BVN_ENROLLMENT_ANDROID';
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  
  const fee = service ? Number(service.defaultAgentPrice) : 0;
  const isActive = service ? service.isActive : false; // <--- Fetch Availability

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
          <DevicePhoneMobileIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BVN Android Enrollment</h1>
          <p className="text-sm text-gray-500">Request setup for Android enrollment and view your Agent Code.</p>
        </div>
      </div>

      {/* Client Component with Availability Prop */}
      <BvnEnrollmentClientPage fee={fee} isActive={isActive} />
    </div>
  );
}
