import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNewspaperClientPage from '@/components/AdminNewspaperClientPage';

export default async function AdminNewspaperPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // Fetch Newspaper Requests
  const requests = await prisma.newspaperRequest.findMany({
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
        select: { name: true, id: true }
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
        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
          <NewspaperIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newspaper Requests</h1>
          <p className="text-sm text-gray-500">Manage Change of Name Publications.</p>
        </div>
      </div>

      <AdminNewspaperClientPage initialRequests={serializedRequests} />
    </div>
  );
}
