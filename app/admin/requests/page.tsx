import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminRequestsHubClientPage from '@/components/AdminRequestsHubClientPage';

export default async function AdminRequestsPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch counts for ALL manual service tables
  // We check for 'PENDING' status which usually indicates manual review is needed
  const [
    ninModCount,
    ninDelinkCount,
    ninValidationCount,
    ipeCount,
    personalizationCount,
    bvnCount,
    cacCount,
    tinCount,
    jambCount,
    resultCount,
    newspaperCount
  ] = await Promise.all([
    prisma.modificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.delinkRequest.count({ where: { status: 'PENDING' } }),
    prisma.validationRequest.count({ where: { status: 'PROCESSING' } }), // API items usually stuck in PROCESSING
    prisma.ipeRequest.count({ where: { status: 'PROCESSING' } }),        // API items usually stuck in PROCESSING
    prisma.personalizationRequest.count({ where: { status: 'PROCESSING' } }), // API items usually stuck in PROCESSING
    prisma.bvnRequest.count({ where: { status: 'PENDING' } }),
    prisma.cacRequest.count({ where: { status: 'PENDING' } }),
    prisma.tinRequest.count({ where: { status: 'PENDING' } }),
    prisma.jambRequest.count({ where: { status: 'PENDING' } }),
    prisma.resultRequest.count({ where: { status: 'PENDING' } }),
    prisma.newspaperRequest.count({ where: { status: 'PENDING' } })
  ]);

  // 2. Organize into a stats object
  const requestStats = {
    ninMod: ninModCount,
    ninDelink: ninDelinkCount,
    ninValidation: ninValidationCount,
    ipe: ipeCount,
    personalization: personalizationCount,
    bvn: bvnCount,
    cac: cacCount,
    tin: tinCount,
    jamb: jambCount,
    result: resultCount,
    newspaper: newspaperCount
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
          <ClipboardDocumentListIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Manager</h1>
          <p className="text-sm text-gray-500">Central hub for all manual service requests.</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminRequestsHubClientPage stats={requestStats} />
    </div>
  );
}


