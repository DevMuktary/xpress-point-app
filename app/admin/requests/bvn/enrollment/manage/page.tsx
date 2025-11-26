import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminBvnEnrollmentSetupClientPage from '@/components/AdminBvnEnrollmentSetupClientPage';

export default async function AdminBvnEnrollmentManagePage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // Fetch Enrollment Setup Requests
  const requests = await prisma.bvnRequest.findMany({
    where: {
      serviceId: 'BVN_ENROLLMENT_ANDROID'
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true
        }
      }
    }
  });

  const serializedRequests = requests.map(req => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
          <UserGroupIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Setup Requests</h1>
          <p className="text-sm text-gray-500">Approve agents for Android Enrollment access.</p>
        </div>
      </div>

      <AdminBvnEnrollmentSetupClientPage initialRequests={serializedRequests} />
    </div>
  );
}
