import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard';

export default function NinServicesPage() {
  
  const ninServices = [
    { title: 'VNIN Slip', href: '/dashboard/services/nin/vnin-slip', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'Validation', href: '/dashboard/services/nin/validation', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'Modification', href: '/dashboard/services/nin/modification', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'By NIN', href: '/dashboard/services/nin/verify-by-nin', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'By Phone', href: '/dashboard/services/nin/verify-by-phone', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'IPE Clearance', href: '/dashboard/services/nin/ipe-clearance', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'Delink NIN', href: '/dashboard/services/nin/delink', logo: '/logos/nin.png', color: "bg-green-50" },
    { title: 'Personalize', href: '/dashboard/services/nin/personalize', logo: '/logos/nin.png', color: "bg-green-50" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {ninServices.map((service) => (
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
