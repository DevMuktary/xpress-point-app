import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SignupClientPage from '@/components/SignupClientPage';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

// This is a "world-class" Server Component
export default async function SubdomainRegisterPage({ params }: { params: { subdomain: string } }) {
  const { subdomain } = params;

  if (!subdomain) {
    redirect('/signup'); // No subdomain, go to normal signup
  }

  // 1. "Fetch" the Aggregator from the database
  const aggregator = await prisma.user.findUnique({
    where: { subdomain: subdomain },
    select: {
      id: true,
      businessName: true
    }
  });

  // 2. If "rubbish" subdomain, redirect to normal signup
  if (!aggregator) {
    redirect('/signup?error=Aggregator+not+found');
  }

  // 3. "World-class" success! Render the client page
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* "Stunning" Header */}
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">
            XPRESS POINT
          </h1>
          {/* "World-Class" Welcome Message */}
          <div className="mt-4 text-center rounded-lg bg-blue-50 p-4 border border-blue-200">
            <ShieldCheckIcon className="mx-auto h-8 w-8 text-blue-600" />
            <p className="mt-2 text-sm text-gray-700">
              You are registering as an agent under the Aggregator:
            </p>
            <p className="text-lg font-bold text-blue-700">
              {aggregator.businessName}
            </p>
          </div>
        </div>
        
        {/* "Refurbish" the client page by passing the new props */}
        <SignupClientPage 
          aggregatorId={aggregator.id} 
          aggregatorName={aggregator.businessName || 'Aggregator'}
        />
      </div>
    </div>
  );
}
