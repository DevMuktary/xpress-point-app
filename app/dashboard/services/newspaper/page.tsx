import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import NewspaperClientPage from '@/components/NewspaperClientPage'; // We will create this next

// This is a Server Component.
export default async function NewspaperPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <NewspaperIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Newspaper Publication
        </h1>
      </div>
      
      {/* --- We render the Client Component --- */}
      <NewspaperClientPage />
    </div>
  );
}
