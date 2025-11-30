import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard';

// This is a Server Component, so it's very fast.
export default function NinServicesPage() {
  
  // --- Refurbished Service List ---
  const ninServices = [
    {
      title: 'NIN Verification (by NIN)',
      description: 'Verify and print slips using an 11-digit NIN.',
      href: '/dashboard/services/nin/verify-by-nin', // Updated href to match folder structure
    },
    {
      title: 'NIN Verification (by Phone)',
      description: 'Verify and print slips using an 11-digit phone number.',
      href: '/dashboard/services/nin/verify-by-phone', // Updated href to match folder structure
    },
    // --- NEW SERVICE ADDED HERE ---
    {
      title: 'VNIN Slip (Instant)',
      description: 'Generate and download your Virtual NIN Slip instantly.',
      href: '/dashboard/services/nin/vnin-slip',
    },
    // ------------------------------
    {
      title: 'IPE Clearance',
      description: 'Service for IPE clearance processes.',
      href: '/dashboard/services/nin/ipe-clearance',
    },
    {
      title: 'Self Service Delink',
      description: 'Service for unlinking processes.',
      href: '/dashboard/services/nin/delink',
    },
    {
      title: 'Personalize NIN (Tracking ID)',
      description: 'Service for NIN personalization using a tracking ID.',
      href: '/dashboard/services/nin/personalize', // Updated href to match folder structure
    },
    {
      title: 'Validation',
      description: 'Includes "No Record Found" & "Update Record" (Mod-Validation).',
      href: '/dashboard/services/nin/validation',
    },
    {
      title: 'NIN Modification',
      description: 'Request changes to your NIN data (Name, DOB, etc.).',
      href: '/dashboard/services/nin/modification',
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

      {/* --- "Refurbished" Service Grid --- */}
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
