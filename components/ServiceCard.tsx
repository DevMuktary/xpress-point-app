"use client"; // <-- THIS IS THE FIX. It marks this as a Client Component.

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

type ServiceCardProps = {
  title: string;
  description: string;
  logo: string;
  href: string;
};

export default function ServiceCard({ title, description, logo, href }: ServiceCardProps) {
  return (
    <Link 
      href={href}
      className="group flex items-start gap-4 rounded-2xl bg-white p-6 shadow-lg 
                 transition-all hover:shadow-xl hover:bg-gray-50"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-gray-100">
        <Image 
          src={logo} 
          alt={`${title} logo`} 
          width={32} 
          height={32}
          // This interactive prop is now allowed
          onError={(e) => e.currentTarget.src = "/logos/default.png"}
        />
      </div>
      <div className="flex-1">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      <ChevronRightIcon className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
