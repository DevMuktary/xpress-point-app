import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard'; // We re-use our "world-class" card

// This is a Server Component, so it's very fast.
export default function JambServicesPage() {
  
  // --- This is the 2-Card "Hub" you designed ---
  const jambServices = [
    {
      title: 'JAMB Slip Printing',
      description: 'Print Original Result, Registration Slip, or Admission Letter.',
      href: '/dashboard/services/jamb/slips', // We will build this page next
    },
    {
      title: 'JAMB Profile Code Retrieval',
      description: 'Retrieve a lost JAMB profile code.',
      href: '/dashboard/services/jamb/profile-code', // We will build this page next
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/jamb.png"
          alt="JAMB Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">JAMB Services</h1>
      </div>

      {/* --- "Refurbished" Card List (1-column, stable on phone) --- */}
      <div className="grid grid-cols-1 gap-6">
        {jambServices.map((service) => (
          <ServiceItemCard
            key={service.title}
            href={service.href}
            title={service.title}
            description={service.description}
            logo="/logos/jamb.png" // Use the JAMB logo for all
          />
        ))}
      </div>
    </div>
  );
}
