"use client"; // This is a simple client component

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

type Props = {
  href: string;
  title: string;
  description: string;
};

export default function ServiceLinkCard({ href, title, description }: Props) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl bg-white p-5 shadow-lg 
                 transition-all hover:shadow-xl hover:border-blue-500 border border-transparent"
    >
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      </div>
      <ChevronRightIcon className="h-6 w-6 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
    </Link>
  );
}
