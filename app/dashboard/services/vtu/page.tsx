import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard';

export default function VtuHubPage() {
  
  const vtuServices = [
    {
      title: 'Buy Airtime',
      href: '/dashboard/services/vtu/airtime',
      logo: '/logos/mtn.png', // Using MTN logo as generic representation
      color: "bg-yellow-50"
    },
    {
      title: 'Buy Data',
      href: '/dashboard/services/vtu/data',
      logo: '/logos/glo.png', // Using Glo logo as generic representation
      color: "bg-green-50"
    },
    {
      title: 'Electricity',
      href: '/dashboard/services/vtu/electricity',
      logo: '/logos/vtu.png', 
      color: "bg-orange-50"
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/vtu.png"
          alt="VTU Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">VTU Services</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {vtuServices.map((service) => (
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
