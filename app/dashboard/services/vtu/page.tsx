import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, PhoneIcon, WifiIcon, BoltIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard'; // We re-use our "world-class" card

// This is a Server Component, so it's very fast.
export default function VtuHubPage() {
  
  // --- This is the 3-Card "Hub" you designed ---
  const vtuServices = [
    {
      title: 'Buy Airtime',
      description: 'Instant top-up for MTN, Glo, Airtel, and 9mobile.',
      href: '/dashboard/services/vtu/airtime',
      logo: PhoneIcon, // Use Icon
    },
    {
      title: 'Buy Data',
      description: 'Purchase data bundles (SME, Gifting, Awoof) for all networks.',
      href: '/dashboard/services/vtu/data',
      logo: WifiIcon, // Use Icon
    },
    {
      title: 'Pay Electricity',
      description: 'Pay your Prepaid or Postpaid electricity bills easily.',
      href: '/dashboard/services/vtu/electricity', // We will build this page
      logo: BoltIcon, // Use Icon
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
          src="/logos/vtu.png"
          alt="VTU Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          VTU Services
        </h1>
      </div>

      {/* --- "Refurbished" Card List (1-column, stable on phone) --- */}
      <div className="grid grid-cols-1 gap-6">
        {vtuServices.map((service) => (
          // This is a "refurbished" ServiceItemCard, using the Icon
          <Link
            key={service.title}
            href={service.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              <service.logo className="h-10 w-10 text-blue-600" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">{service.title}</h3>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{service.description}</p>
            </div>
            <div className="mt-6">
              <span 
                className="inline-block rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 
                           transition-all group-hover:bg-blue-600 group-hover:text-white"
              >
                Use Service →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
