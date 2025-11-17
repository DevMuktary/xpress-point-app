import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { getUserFromSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TinClientPage from '@/components/TinClientPage';

// Helper to get service data
async function getServiceData(serviceId: string, userId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return { service: null, price: 0 };
    }

    // --- THIS IS THE FIX ---
    const price = service.defaultAgentPrice.toNumber();
    // -----------------------
    
    return { service, price };
  } catch (error) {
    console.error("Error fetching service data:", error);
    return { service: null, price: 0 };
  }
}

export default async function TinServicePage({ params }: { params: { serviceId: string } }) {
  const user = await getUserFromSession();
  if (!user) {
    redirect('/login?error=Please+login+to+continue');
  }

  const { serviceId } = params;
  const { service, price } = await getServiceData(serviceId, user.id);

  if (!service) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <p>Service not found or is currently unavailable.</p>
        <Link href="/dashboard/services/tin" className="text-blue-600 hover:underline">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/tin" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <DocumentTextIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          {service.name}
        </h1>
      </div>
      
      <TinClientPage 
        serviceId={service.id} 
        serviceName={service.name} 
        serviceFee={price} 
      />
    </div>
  );
}
