import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import NpcRequestDetail from '@/components/admin/NpcRequestDetail';

interface PageProps {
  params: { id: string };
}

export default async function AdminNpcRequestDetailPage({ params }: PageProps) {
  const user = await getUserFromSession();
  if (!user || user.role !== 'ADMIN') {
    redirect('/login-admin');
  }

  const request = await prisma.npcRequest.findUnique({
    where: { id: params.id },
    include: { user: true }
  });

  if (!request) {
    return notFound();
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/requests/npc" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Details</h1>
          <p className="text-sm text-gray-500">
            ID: {request.id} • User: {request.user.email}
          </p>
        </div>
      </div>

      {/* Client Component */}
      <NpcRequestDetail request={request} />
    </div>
  );
}
