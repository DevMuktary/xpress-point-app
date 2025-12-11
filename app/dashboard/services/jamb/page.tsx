import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard';

export default function JambServicesPage() {
  
  const jambServices = [
    { title: 'Print Slip', href: '/dashboard/services/jamb/slips', logo: '/logos/jamb.png', color: "bg-yellow-50" },
    { title: 'Profile Code', href: '/dashboard/services/jamb/profile-code', logo: '/logos/jamb.png', color: "bg-yellow-50" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {jambServices.map((service) => (
          <ServiceItemCard
            key={service.title}
            href={service.href}
            title={service.title}
            logo={service.logo}
            color={service.color}
          />
        ))}
      </div>
    </div>
  );
}
