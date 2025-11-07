import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ServiceLinkCard from '@/components/ServiceLinkCard';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

// This is a Server Component, so it's very fast.
export default function NinServicesPage() {
  
  // This is the list of services from your original blueprint
  const ninServices = [
    {
      title: 'NIN Verification',
      description: 'Verify and print Regular, Standard, or Premium slips.',
      href: '/dashboard/services/nin/verification', // This is our next step
    },
    {
      title: 'IPE Clearance',
      description: 'Service for IPE clearance processes.',
      href: '#', // We will build this page later
    },
    {
      title: 'Self Service Delink',
      description: 'Service for unlinking processes.',
      href: '#',
    },
    {
      title: 'Personalize NIN (Tracking ID)',
      description: 'Service for NIN personalization using a tracking ID.',
      href: '#',
    },
    {
      title: 'Validation',
      description: 'Includes "No Record Found" & "Update Record" (Mod-Validation).',
      href: '#',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <Image
          src="/logos/nin.png"
          alt="NIN Logo"
          width={40}
          height={40}
          onError={(e) => (e.currentTarget.src = '/logos/default.png')}
        />
        <h1 className="text-2xl font-bold text-gray-900">NIN Services</h1>
      </div>

      {/* --- Service List --- */}
      <div className="flex flex-col gap-4">
        {ninServices.map((service) => (
          <ServiceLinkCard
            key={service.title}
            href={service.href}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>
    </div>
  );
}
