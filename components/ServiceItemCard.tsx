"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage'; // We'll use our safe image component

type Props = {
  href: string;
  title: string;
  description: string;
  logo: string;
};

export default function ServiceItemCard({ href, title, description, logo }: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-lg 
                 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div>
        {/* Logo */}
        <SafeImage
          src={logo}
          alt={`${title} Logo`}
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        
        {/* Title */}
        <h3 className="mt-4 text-lg font-bold text-gray-900">{title}</h3>
        
        {/* Description */}
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
      
      {/* Action Button */}
      <div className="mt-6">
        <span 
          className="inline-block rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 
                     transition-all group-hover:bg-blue-600 group-hover:text-white"
        >
          Use Service →
        </span>
      </div>
    </Link>
  );
}
