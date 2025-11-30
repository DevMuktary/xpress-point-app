import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import AdminBroadcastClient from '@/components/AdminBroadcastClient'; // We create this below
import { prisma } from '@/lib/prisma';

export default async function AdminBroadcastPage() {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin');
  }

  // Fetch current banner content
  const bannerSetting = await prisma.systemSetting.findUnique({
    where: { key: 'dashboard_banner' }
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <MegaphoneIcon className="h-8 w-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">Broadcast & Notifications</h1>
      </div>

      <AdminBroadcastClient initialBanner={bannerSetting?.value || ''} />
    </div>
  );
}
