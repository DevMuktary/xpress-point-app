import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import ModificationHistoryClientPage from '@/components/ModificationHistoryClientPage'; // We will create this next

// This is a Server Component.
export default async function NinModificationHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <PencilSquareIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Modification History
        </h1>
      </div>
      
      {/* --- We render the Client Component --- */}
      <ModificationHistoryClientPage />
    </div>
  );
}
