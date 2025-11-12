import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import VerificationHistoryClientPage from '@/components/VerificationHistoryClientPage';

// This is a Server Component. It fetches data on the server.
export default async function NinVerificationHistoryPage() {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  // --- THIS IS THE "WORLD-CLASS" FIX ---
  // 1. Get all verifications that are NOT expired
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const requests = await prisma.ninVerification.findMany({
    where: { 
      userId: user.id,
      expiresAt: { // <-- Fixed: Use 'expiresAt'
        gte: new Date() // Find all slips that have not expired
      }
    },
    orderBy: { expiresAt: 'desc' }, // Show newest first
    // 2. "World-Class" logic: Include all transactions (slip purchases)
    //    that are linked to this verification.
    include: {
      transactions: {
        where: {
          status: 'COMPLETED',
          serviceId: {
            in: ['NIN_SLIP_REGULAR', 'NIN_SLIP_STANDARD', 'NIN_SLIP_PREMIUM']
          }
        },
        select: {
          serviceId: true // We just need to know *which* slip was bought
        }
      }
    }
  });
  // --------------------------------------------

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <DocumentMagnifyingGlassIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          NIN Verification History
        </h1>
      </div>
      
      {/* 3. Pass the full, "refurbished" data to the client */}
      <VerificationHistoryClientPage initialRequests={requests} />
    </div>
  );
}
