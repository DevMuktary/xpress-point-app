import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import ServiceItemCard from '@/components/ServiceItemCard'; // We re-use our "world-class" card
import { 
  ClockIcon, 
  IdentificationIcon, 
  DocumentMagnifyingGlassIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

// This is a Server Component, so it's very fast.
export default function HistoryHubPage() {
  
  // --- This is the list of History Categories ---
  const historyCategories = [
    {
      title: 'Wallet Transaction History',
      description: 'View all your wallet debits and credits.',
      href: '/dashboard/history/wallet', // We will build this page
      logo: ClockIcon,
    },
    {
      title: 'NIN Modification History',
      description: 'Check and monitor your NIN modification status here.',
      href: '/dashboard/history/modification', // We will build this page
      logo: IdentificationIcon,
    },
    {
      title: 'NIN Verification History',
      description: 'Regenerate your exact NIN verification slip here (slips expire in 24 hrs).',
      href: '/dashboard/history/verification', // We will build this page
      logo: DocumentMagnifyingGlassIcon,
    },
    {
      title: 'IPE Clearance History',
      description: 'Check the status of your IPE clearance requests.',
      href: '/dashboard/history/ipe', // We will build this page
      logo: ShieldCheckIcon,
    },
    {
      title: 'NIN Validation History',
      description: 'Check the status of your NIN validation requests.',
      href: '/dashboard/history/validation', // We will build this page
      logo: ShieldCheckIcon,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <ClockIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Transaction History
        </h1>
      </div>

      {/* --- "Refurbished" Card List (1-column, stable on phone) --- */}
      <div className="grid grid-cols-1 gap-6">
        {historyCategories.map((service) => (
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
                View History →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
