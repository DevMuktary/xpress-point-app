import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BvnEnrollmentClientPage from '@/components/BvnEnrollmentClientPage';
import SafeImage from '@/components/SafeImage';

export default async function BvnEnrollmentPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const service = await prisma.service.findUnique({
    where: { id: 'BVN_ENROLLMENT_ANDROID' },
  });
  if (!service) {
    throw new Error("BVN_ENROLLMENT_ANDROID service not found.");
  }

  // --- THIS IS THE FIX ---
  const serviceFee = service.defaultAgentPrice.toNumber();
  // -----------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/bvn.png"
          alt="BVN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          BVN Android Enrollment User
        </h1>
      </div>
      <BvnEnrollmentClientPage fee={serviceFee} />
    </div>
  );
}
