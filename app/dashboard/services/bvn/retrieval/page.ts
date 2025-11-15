import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import BvnRetrievalClientPage from '@/components/BvnRetrievalClientPage'; // We will create this next
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default async function BvnRetrievalPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/bvn" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/bvn.png"
          alt="BVN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          BVN Retrieval
        </h1>
      </div>
      
      {/* --- We render the Client Component --- */}
      <BvnRetrievalClientPage />
    </div>
  );
}
