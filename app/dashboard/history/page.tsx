import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import ServiceItemCard from '@/components/ServiceItemCard'; // We re-use our "world-class" card
import { 
  ClockIcon, 
  IdentificationIcon, 
  DocumentMagnifyingGlassIcon, 
  LinkIcon,
  NewspaperIcon,
  BriefcaseIcon,
  RectangleStackIcon,
  AcademicCapIcon // <-- THIS IS THE "WORLD-CLASS" FIX
} from '@heroicons/react/24/outline';

// This is a Server Component, so it's very fast.
export default function HistoryHubPage() {
  
  // --- THIS IS THE "WORLD-CLASS" REBURBISHED LIST ---
  // JAMB History is now included.
  const historyCategories = [
    {
      title: 'Wallet Transaction History',
      description: 'View all your wallet debits and credits.',
      href: '/dashboard/history/wallet', 
      logo: ClockIcon,
    },
    {
      title: 'NIN Verification History',
      description: 'Regenerate your exact NIN verification slip here (slips expire in 24 hrs).',
      href: '/dashboard/history/verification',
      logo: DocumentMagnifyingGlassIcon,
    },
    {
      title: 'NIN Modification History',
      description: 'Check and monitor your NIN modification status here.',
      href: '/dashboard/history/modification',
      logo: IdentificationIcon,
    },
    {
      title: 'NIN Delink History',
      description: 'Check the status of your NIN delink requests.',
      href: '/dashboard/history/delink',
      logo: LinkIcon,
    },
    {
      title: 'Newspaper History',
      description: 'Check the status and download your completed publications.',
      href: '/dashboard/history/newspaper',
      logo: NewspaperIcon,
    },
    {
      title: 'CAC History',
      description: 'Check the status and download your CAC documents.',
      href: '/dashboard/history/cac',
      logo: BriefcaseIcon,
    },
    {
      title: 'JTB TIN History',
      description: 'Check the status of your TIN registrations.',
      href: '/dashboard/history/tin',
      logo: RectangleStackIcon,
    },
    // --- THIS IS THE "WORLD-CLASS" FIX ---
    {
      title: 'JAMB History',
      description: 'Check the status and download your JAMB slips.',
      href: '/dashboard/history/jamb',
      logo: AcademicCapIcon,
    },
    // ------------------------------------
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
              {/* This is a "world-class" way to render the icon */}
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
