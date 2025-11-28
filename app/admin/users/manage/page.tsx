import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import AdminUserManageClient from '@/components/AdminUserManageClient';

export default async function AdminUserManagePage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin?error=Access+Denied');
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-gray-900 rounded-lg text-white">
          <WrenchScrewdriverIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Manager</h1>
          <p className="text-sm text-gray-500">Search, Fund, and Suspend accounts.</p>
        </div>
      </div>

      <AdminUserManageClient />
    </div>
  );
}
