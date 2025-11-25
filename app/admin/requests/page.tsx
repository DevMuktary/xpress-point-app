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

  // Fetch counts only for the specific manual services listed
  const [
    ninModCount,
    ninDelinkCount,
    ninValidationCount,
    bvnCount,
    jambCount,
    tinCount,
    resultCount,
    cacCount,
    newspaperCount
  ] = await Promise.all([
    // NIN Services (Separate Tables)
    prisma.modificationRequest.count({ where: { status: 'PENDING' } }),
    prisma.delinkRequest.count({ where: { status: 'PENDING' } }),
    prisma.validationRequest.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }), // Validation might sit in processing
    
    // Consolidated Services (One Table per Category)
    prisma.bvnRequest.count({ where: { status: 'PENDING' } }),       // Covers Retrieval, Mod, Android, VNIN-NIBSS
    prisma.jambRequest.count({ where: { status: 'PENDING' } }),      // Covers Slip & Profile Code
    prisma.tinRequest.count({ where: { status: 'PENDING' } }),       // Covers Reg & Retrieval
    prisma.resultRequest.count({ where: { status: 'PENDING' } }),    // Covers Request Result
    prisma.cacRequest.count({ where: { status: 'PENDING' } }),       // All CAC
    prisma.newspaperRequest.count({ where: { status: 'PENDING' } })  // All Newspaper
  ]);

  const stats = {
    ninMod: ninModCount,
    ninDelink: ninDelinkCount,
    ninValidation: ninValidationCount,
    bvn: bvnCount,
    jamb: jambCount,
    tin: tinCount,
    result: resultCount,
    cac: cacCount,
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
