import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminNpcRequestsClientPage from '@/components/admin/AdminNpcRequestsClientPage';

export default async function AdminNpcRequestsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin');
  }

  const requests = await prisma.npcRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
          <ShieldCheckIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NPC Requests</h1>
          <p className="text-sm text-gray-500">Manage and process NPC Attestation requests.</p>
        </div>
      </div>
      <AdminNpcRequestsClientPage initialRequests={requests} />
    </div>
  );
}
