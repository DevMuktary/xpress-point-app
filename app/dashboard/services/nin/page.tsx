import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage'; // Use our safe image
import ServiceItemCard from '@/components/ServiceItemCard'; // <-- Import the NEW card

// This is a Server Component, so it's very fast.
export default function NinServicesPage() {
  
  // This is the list of services from your original blueprint
  const ninServices = [
    {
      title: 'NIN Verification',
      description: 'Verify and print Regular, Standard, or Premium slips.',
      href: '/dashboard/services/nin/verification',
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
    {
      title: 'NIN Modification',
      description: 'Request changes to your NIN data (Name, DOB, etc.).',
      href: '#',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
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
        <h1 className="text-2xl font-bold text-gray-900">NIN Services</h1>
      </div>

      {/* --- NEW: Service Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ninServices.map((service) => (
          <ServiceItemCard
            key={service.title}
            href={service.href}
            title={service.title}
            description={service.description}
            logo="/logos/nin.png" // Use the NIMC logo for all
          />
        ))}
      </div>
    </div>
  );
}
