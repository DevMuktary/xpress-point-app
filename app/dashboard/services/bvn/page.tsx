import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
// We no longer need the other icons, as we are using the BVN logo
// import { 
//   ShieldCheckIcon,
//   DocumentMagnifyingGlassIcon,
//   PencilSquareIcon,
//   UserPlusIcon,
//   LinkIcon
// } from '@heroicons/react/24/outline';

// This is a Server Component, so it's very fast.
export default function BvnHubPage() {
  
  // This is the list of BVN Services
  // The 'logo' prop has been removed, as we will use the BVN logo for all
  const bvnServices = [
    {
      title: 'BVN Verification',
      description: 'Verify BVN and print a verification slip.',
      href: '/dashboard/services/bvn/verification',
    },
    {
      title: 'BVN Retrieval',
      description: 'Retrieve a BVN using a Phone Number or C.R.M. details.',
      href: '/dashboard/services/bvn/retrieval',
    },
    {
      title: 'BVN Modification',
      description: 'Request manual modification for Name, DOB, or Phone.',
      href: '/dashboard/services/bvn/modification',
    },
    {
      title: 'BVN Android Enrollment',
      description: 'Submit details for a new BVN Android Enrollment.',
      href: '/dashboard/services/bvn/enrollment',
    },
    {
      title: 'VNIN to NIBSS',
      description: 'Submit a VNIN slip to NIBSS for manual processing.',
      href: '/dashboard/services/bvn/vnin-to-nibss',
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
          src="/logos/bvn.png"
          alt="BVN Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">BVN Services</h1>
      </div>

      {/* --- Card List (1-column on mobile) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bvnServices.map((service) => (
          <Link
            key={service.title}
            href={service.href}
            className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                       transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              {/* --- THIS IS THE FIX --- */}
              {/* Replaced the SVG icon with the SafeImage component */}
              <SafeImage
                src="/logos/bvn.png"
                alt={service.title}
                width={40}
                height={40}
                fallbackSrc="/logos/default.png"
                className="rounded-full"
              />
              {/* ----------------------- */}
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
