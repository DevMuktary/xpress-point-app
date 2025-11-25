import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNinDelinkClientPage from '@/components/AdminNinDelinkClientPage';

export default async function AdminNinDelinkPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch Requests
  const requests = await prisma.delinkRequest.findMany({
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

  // 2. Serialize
  const serializedRequests = requests.map(req => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
          <XCircleIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NIN Delink Requests</h1>
          <p className="text-sm text-gray-500">Manage requests to delink phone numbers from NIN.</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminNinDelinkClientPage initialRequests={serializedRequests} />
    </div>
  );
}
