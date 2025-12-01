import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminValidationRequestsClientPage from '@/components/admin/AdminValidationRequestsClientPage';

export default async function AdminValidationPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  // --- FIX: Fetch ALL requests, not just 'PENDING' ---
  // This ensures they don't disappear when you change their status.
  const requests = await prisma.validationRequest.findMany({
    // where: { status: 'PENDING' }, <--- REMOVED THIS LINE
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/requests" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <CheckBadgeIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NIN Validation Manager</h1>
          <p className="text-sm text-gray-500">Process Manual Validation Requests (No Record / Updates).</p>
        </div>
      </div>

      <AdminValidationRequestsClientPage initialRequests={requests} />
    </div>
  );
}
