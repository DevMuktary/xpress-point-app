import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default function CacHubPage() {
  
  const cacServices = [
    {
      id: 'CAC_REG_BN',
      title: 'CAC Business Name Registration',
      description: 'Register a new business name with the CAC.',
      href: '/dashboard/services/cac/CAC_REG_BN',
    },
    {
      id: 'CAC_DOC_RETRIEVAL',
      title: 'CAC Document Retrieval',
      description: 'Request retrieval of existing CAC documents.',
      href: '/dashboard/services/cac/CAC_DOC_RETRIEVAL',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <BriefcaseIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">CAC Services</h1>
      </div>

      {/* --- Card List (1-column on mobile) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cacServices.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              <BriefcaseIcon className="h-10 w-10 text-blue-600" />
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
