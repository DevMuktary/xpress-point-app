import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

import { getUserFromSession } from '@/lib/auth';
import ModificationClientPage from '@/components/ModificationClientPage'; // We will create this next
import { prisma } from '@/lib/prisma';

// This is a Server Component.
export default async function NinModificationPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login');
  }

  // 1. Get the user's consent status from the database
  const hasAgreed = user.hasAgreedToModificationTerms;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/nin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/nin.png"
          alt="NIN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Modification
        </h1>
      </div>
      
      {/* 2. Pass the user's consent status to the 
           interactive Client Component.
      */}
      <ModificationClientPage hasAlreadyAgreed={hasAgreed} />
    </div>
  );
}
