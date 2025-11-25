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

  // 1. Fetch counts for specific manual services
  const [
    ninModCount,
    ninDelinkCount,
    
    // BVN Broken Down
    bvnRetrievalCount,
    bvnModCount,
    bvnEnrollmentCount,
    bvnNibssCount,

    // Other Manual Services
    cacCount,
    tinCount,
    jambCount,
    resultCount,
    newspaperCount
  ] = await Promise.all([
    // NIN (Manual Only)
    prisma.modificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.delinkRequest.count({ where: { status: 'PENDING' } }),
    
    // BVN (Specific IDs)
    prisma.bvnRequest.count({ 
      where: { 
        status: 'PENDING',
        serviceId: { in: ['BVN_RETRIEVAL_PHONE', 'BVN_RETRIEVAL_CRM'] } 
      } 
    }),
    prisma.bvnRequest.count({ 
      where: { 
        status: 'PENDING',
        serviceId: { startsWith: 'BVN_MOD' } 
      } 
    }),
    prisma.bvnRequest.count({ 
      where: { 
        status: 'PENDING',
        serviceId: 'BVN_ENROLLMENT_ANDROID'
      } 
    }),
    prisma.bvnRequest.count({ 
      where: { 
        status: 'PENDING',
        serviceId: 'BVN_VNIN_TO_NIBSS'
      } 
    }),

    // Others
    prisma.cacRequest.count({ where: { status: 'PENDING' } }),
    prisma.tinRequest.count({ where: { status: 'PENDING' } }),
    prisma.jambRequest.count({ where: { status: 'PENDING' } }),
    prisma.resultRequest.count({ where: { status: 'PENDING' } }),
    prisma.newspaperRequest.count({ where: { status: 'PENDING' } })
  ]);

  // 2. Organize into a stats object
  const stats = {
    ninMod: ninModCount,
    ninDelink: ninDelinkCount,
    
    bvnRetrieval: bvnRetrievalCount,
    bvnMod: bvnModCount,
    bvnEnrollment: bvnEnrollmentCount,
    bvnNibss: bvnNibssCount,

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
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <ClipboardDocumentListIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Request Manager</h1>
          <p className="text-sm text-gray-500">Manage all pending applications requiring manual attention.</p>
        </div>
      </div>

      {/* Client Component */}
      <AdminRequestsHubClientPage stats={stats} />
    </div>
  );
}
