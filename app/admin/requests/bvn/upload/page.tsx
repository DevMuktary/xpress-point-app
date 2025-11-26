import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminBvnUploadClientPage from '@/components/AdminBvnUploadClientPage';

export default async function AdminBvnUploadPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // Fetch recent upload stats
  const totalResults = await prisma.bvnEnrollmentResult.count();
  
  const recentUploads = await prisma.bvnEnrollmentResult.findMany({
    take: 10,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      ticketNumber: true,
      agentCode: true,
      status: true,
      updatedAt: true
    }
  });

  const serializedUploads = recentUploads.map(r => ({
    ...r,
    updatedAt: r.updatedAt.toISOString()
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <CloudArrowUpIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Enrollment Report</h1>
          <p className="text-sm text-gray-500">Upload the CSV file from NIBSS to update agent results.</p>
        </div>
      </div>

      <AdminBvnUploadClientPage totalRecords={totalResults} recentUploads={serializedUploads} />
    </div>
  );
}
