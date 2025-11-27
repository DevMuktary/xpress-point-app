import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminResultClientPage from '@/components/AdminResultClientPage';

export default async function AdminResultPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // Fetch Result Requests (WAEC/NECO/NABTEB)
  const requests = await prisma.resultRequest.findMany({
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
        <div className="p-2 bg-pink-100 rounded-lg text-pink-700">
          <DocumentTextIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Result Checker Requests</h1>
          <p className="text-sm text-gray-500">Manage manual WAEC, NECO, and NABTEB result requests.</p>
        </div>
      </div>

      <AdminResultClientPage initialRequests={serializedRequests} />
    </div>
  );
}
