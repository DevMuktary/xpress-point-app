import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import NewspaperHistoryClientPage from '@/components/NewspaperHistoryClientPage';

export default async function NewspaperHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const requests = await prisma.newspaperRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      service: { select: { name: true } }
    }
  });

  const serializedRequests = requests.map(req => ({
    id: req.id,
    serviceName: req.service.name,
    status: req.status,
    statusMessage: req.statusMessage,
    formData: req.formData,
    publicationUrl: req.publicationUrl,
    pageNumber: req.pageNumber,
    createdAt: req.createdAt.toISOString(),
  }));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
          <NewspaperIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newspaper History</h1>
          <p className="text-sm text-gray-500">Track your Change of Name publications.</p>
        </div>
      </div>
      
      <NewspaperHistoryClientPage initialRequests={serializedRequests} />
    </div>
  );
}
