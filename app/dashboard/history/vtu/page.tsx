import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, PhoneIcon, WifiIcon, BoltIcon } from '@heroicons/react/24/outline';
import ServiceItemCard from '@/components/ServiceItemCard';

// This is a Server Component.
export default function VtuHistoryHubPage() {
  
  const historyCategories = [
    {
      title: 'Airtime History',
      description: 'View all your past Airtime purchases.',
      href: '/dashboard/history/vtu/airtime', // We will build this
      logo: PhoneIcon,
    },
    {
      title: 'Data History',
      description: 'View all your past Data bundle purchases.',
      href: '/dashboard/history/vtu/data', // We will build this
      logo: WifiIcon,
    },
    {
      title: 'Electricity History',
      description: 'View all your past Electricity token purchases.',
      href: '/dashboard/history/vtu/electricity', // We will build this
      logo: BoltIcon,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <PhoneIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          VTU History
        </h1>
      </div>

      {/* --- "Refurbished" Card List --- */}
      <div className="grid grid-cols-1 gap-6">
        {historyCategories.map((service) => (
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
                View History →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
