import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminBvnEnrollmentClientPage from '@/components/AdminBvnEnrollmentClientPage';

export default async function AdminBvnEnrollmentPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // 1. Fetch Stats (Total Records in Results Table)
  const totalResults = await prisma.bvnEnrollmentResult.count();
  
  // 2. Fetch Recent Uploads (Top 20)
  const recentResults = await prisma.bvnEnrollmentResult.findMany({
    take: 20,
    orderBy: { updatedAt: 'desc' }
  });

  const serializedResults = recentResults.map(r => ({
    id: r.id,
    ticketNumber: r.ticketNumber,
    agentCode: r.agentCode,
    status: r.status,
    message: r.message,
    updatedAt: r.updatedAt.toISOString()
  }));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
          <DevicePhoneMobileIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BVN Enrollment Manager</h1>
          <p className="text-sm text-gray-500">Upload CSV reports from NIBSS/BMS terminals.</p>
        </div>
      </div>

      <AdminBvnEnrollmentClientPage 
        totalResults={totalResults} 
        recentResults={serializedResults} 
      />
    </div>
  );
}
