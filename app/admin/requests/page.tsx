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

  const [
    ninModCount,
    ninDelinkCount,
    // BVN
    bvnRetrievalCount,
    bvnModCount,
    bvnEnrollmentSetupCount, // Count of agents waiting for setup
    bvnNibssCount,
    // Others
    cacCount,
    tinCount,
    jambCount,
    resultCount,
    newspaperCount,
    npcCount // <--- New
  ] = await Promise.all([
    prisma.modificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.delinkRequest.count({ where: { status: 'PENDING' } }),
    
    // BVN
    prisma.bvnRequest.count({ where: { status: 'PENDING', serviceId: { in: ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'] } } }),
    prisma.bvnRequest.count({ where: { status: 'PENDING', serviceId: { startsWith: 'BVN_MOD' } } }),
    prisma.bvnRequest.count({ where: { status: 'PENDING', serviceId: 'BVN_ENROLLMENT_ANDROID' } }), // Setup requests
    prisma.bvnRequest.count({ where: { status: 'PENDING', serviceId: 'BVN_VNIN_TO_NIBSS' } }),

    // Others
    prisma.cacRequest.count({ where: { status: 'PENDING' } }),
    prisma.tinRequest.count({ where: { status: 'PENDING' } }),
    prisma.jambRequest.count({ where: { status: 'PENDING' } }),
    prisma.resultRequest.count({ where: { status: 'PENDING' } }),
    prisma.newspaperRequest.count({ where: { status: 'PENDING' } }),
    prisma.npcRequest.count({ where: { status: 'PENDING' } }) // <--- New
  ]);

  const stats = {
    ninMod: ninModCount,
    ninDelink: ninDelinkCount,
    bvnRetrieval: bvnRetrievalCount,
    bvnMod: bvnModCount,
    bvnEnrollmentSetup: bvnEnrollmentSetupCount,
    bvnNibss: bvnNibssCount,
    cac: cacCount,
    tin: tinCount,
    jamb: jambCount,
    result: resultCount,
    newspaper: newspaperCount,
    npc: npcCount // <--- New
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <ClipboardDocumentListIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Manager</h1>
          <p className="text-sm text-gray-500">Central hub for all manual service requests.</p>
        </div>
      </div>
      <AdminRequestsHubClientPage stats={stats} />
    </div>
  );
}
