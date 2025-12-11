import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard';

export default function BvnHubPage() {
  
  const bvnServices = [
    { title: 'Verification', href: '/dashboard/services/bvn/verification', logo: '/logos/bvn.png', color: "bg-red-50" },
    { title: 'Retrieval', href: '/dashboard/services/bvn/retrieval', logo: '/logos/bvn.png', color: "bg-red-50" },
    { title: 'Modification', href: '/dashboard/services/bvn/modification', logo: '/logos/bvn.png', color: "bg-red-50" },
    { title: 'Enrollment', href: '/dashboard/services/bvn/enrollment', logo: '/logos/bvn.png', color: "bg-red-50" },
    { title: 'VNIN > NIBSS', href: '/dashboard/services/bvn/vnin-to-nibss', logo: '/logos/bvn.png', color: "bg-red-50" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/bvn.png"
          alt="BVN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">BVN Services</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {bvnServices.map((service) => (
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
