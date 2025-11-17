import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

// This is a Server Component.
export default function TinHubPage() {
  
  // The 4 TIN services you designed
  const tinServices = [
    {
      id: 'TIN_REG_PERSONAL',
      title: 'TIN Registration (Personal)',
      description: 'Register for a new Personal TIN.',
      href: '/dashboard/services/tin/TIN_REG_PERSONAL',
    },
    {
      id: 'TIN_REG_BUSINESS',
      title: 'TIN Registration (Business)',
      description: 'Register for a new Business TIN.',
      href: '/dashboard/services/tin/TIN_REG_BUSINESS',
    },
    {
      id: 'TIN_RETRIEVAL_PERSONAL',
      title: 'TIN Retrieval (Personal)',
      description: 'Retrieve an existing Personal TIN.',
      href: '/dashboard/services/tin/TIN_RETRIEVAL_PERSONAL',
    },
    {
      id: 'TIN_RETRIEVAL_BUSINESS',
      title: 'TIN Retrieval (Business)',
      description: 'Retrieve an existing Business TIN.',
      href: '/dashboard/services/tin/TIN_RETRIEVAL_BUSINESS',
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
          src="/logos/tin.png"
          alt="TIN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">JTB TIN Services</h1>
      </div>

      {/* --- Card List --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tinServices.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              <DocumentTextIcon className="h-10 w-10 text-blue-600" />
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
