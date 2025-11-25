import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NinModAdminClient from '@/components/admin/NinModAdminClient';

export default async function NinModAdminPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // Fetch Requests (Newest first)
  const requests = await prisma.modificationRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true
        }
      },
      service: {
        select: { name: true }
      }
    }
  });

  // Serialize JSON data and Dates
  const serializedRequests = requests.map(req => ({
    ...req,
    formData: req.formData,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString()
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">NIN Modification Requests</h1>
      </div>

      {/* Client Component */}
      <NinModAdminClient initialRequests={serializedRequests} />
    </div>
  );
}
