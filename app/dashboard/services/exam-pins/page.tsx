import React from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import ServiceItemCard from '@/components/ServiceItemCard';

export default function ExamPinsHubPage() {
  
  const examServices = [
    {
      title: 'Check Result',
      href: '/dashboard/services/exam-pins/request-result',
      logo: '/logos/waec.png', 
      color: "bg-blue-50"
    },
    {
      title: 'WAEC Pin',
      href: '/dashboard/services/exam-pins/waec',
      logo: '/logos/waec.png',
      color: "bg-yellow-50"
    },
    {
      title: 'NECO Pin',
      href: '/dashboard/services/exam-pins/neco',
      logo: '/logos/neco.png',
      color: "bg-green-50"
    },
    {
      title: 'NABTEB Pin',
      href: '/dashboard/services/exam-pins/nabteb',
      logo: '/logos/nabteb.png',
      color: "bg-red-50"
    },
    {
      title: 'JAMB Pin',
      href: '/dashboard/services/exam-pins/jamb',
      logo: '/logos/jamb.png',
      color: "bg-purple-50"
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <DocumentTextIcon className="h-8 w-8 text-gray-900" />
        <h1 className="text-2xl font-bold text-gray-900">Exam Pins</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {examServices.map((service) => (
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
