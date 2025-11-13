import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';
import ServiceItemCard from '@/components/ServiceItemCard'; // We re-use our "world-class" card
import { DocumentTextIcon } from '@heroicons/react/24/outline';

// This is a Server Component, so it's very fast.
export default function ExamPinsHubPage() {
  
  // --- THIS IS THE "WORLD-CLASS" REFURBISHED LIST ---
  const examServices = [
    {
      title: 'WAEC Result Pin',
      description: 'Purchase PINs to check WAEC results.',
      href: '/dashboard/services/exam-pins/waec',
      logo: '/logos/waec.png',
    },
    {
      title: 'NECO Result Pin',
      description: 'Purchase PINs to check NECO results.',
      href: '/dashboard/services/exam-pins/neco',
      logo: '/logos/neco.png',
    },
    {
      title: 'NABTEB Result Pin',
      description: 'Purchase PINs to check NABTEB results.',
      href: '/dashboard/services/exam-pins/nabteb',
      logo: '/logos/nabteb.png',
    },
    {
      title: 'JAMB Services',
      description: 'Purchase UTME or Direct Entry (DE) PINs.',
      href: '/dashboard/services/exam-pins/jamb',
      logo: '/logos/jamb.png',
    },
    // --- NEW "WORLD-CLASS" CARD (Your Design) ---
    {
      title: 'Request Result (Manual)',
      description: 'Admin will check and get your result slip for you.',
      href: '/dashboard/services/exam-pins/request-result',
      logo: '/logos/waec.png', // We can re-use the WAEC logo
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <DocumentTextIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">
          Exam Result Pins
        </h1>
      </div>

      {/* --- "Refurbished" Card List (stable on phone) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {examServices.map((service) => (
          <ServiceItemCard
            key={service.title}
            href={service.href}
            title={service.title}
            description={service.description}
            logo={service.logo}
          />
        ))}
      </div>
    </div>
  );
}
