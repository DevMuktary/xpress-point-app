"use client";

import React from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';

type Props = {
  href: string;
  title: string;
  logo: string;
  color?: string; // Optional background color hint
};

export default function ServiceItemCard({ href, title, logo, color = "bg-white" }: Props) {
  return (
    <Link
      href={href}
      className={`group flex flex-col items-center justify-center rounded-xl ${color} p-4 shadow-sm border border-gray-100
                 transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95`}
    >
      <div className="relative mb-2 h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full bg-white shadow-sm p-1">
        <SafeImage
          src={logo}
          alt={title}
          width={48}
          height={48}
          fallbackSrc="/logos/default.png"
          className="h-full w-full object-contain"
        />
      </div>
      
      <h3 className="text-center text-xs sm:text-sm font-bold text-gray-700 leading-tight">
        {title}
      </h3>
    </Link>
  );
}
