"use client";

import React from 'react';
import Link from 'next/link';
import {
  IdentificationIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  NewspaperIcon,
  PhoneIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

type RequestStats = {
  ninMod: number;
  ninDelink: number;
  bvn: number;
  cac: number;
  tin: number;
  jamb: number;
  result: number;
  newspaper: number;
  vtu: number;
};

// Helper Component for a single Request Category Card
const RequestCard = ({ 
  title, 
  count, 
  href, 
  icon: Icon, 
  colorClass 
}: { 
  title: string; 
  count: number; 
  href: string; 
  icon: React.ElementType; 
  colorClass: string; 
}) => {
  const hasPending = count > 0;

  return (
    <Link 
      href={href}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-200
        ${hasPending 
          ? 'bg-white border-red-200 shadow-md hover:shadow-lg hover:border-red-300' 
          : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-blue-200 hover:shadow-sm'
        }`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${hasPending ? 'bg-red-50 text-red-600' : 'bg-white text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50'} transition-colors`}>
          <Icon className="h-8 w-8" />
        </div>
        {hasPending ? (
          <span className="flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-red-600 text-white text-sm font-bold shadow-sm animate-pulse">
            {count}
          </span>
        ) : (
          <span className="flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-full bg-gray-200 text-gray-500 text-sm font-semibold">
            0
          </span>
        )}
      </div>

      <div className="mt-6">
        <h3 className={`text-lg font-bold ${hasPending ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}>
          {title}
        </h3>
        <div className="flex items-center gap-2 mt-2 text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
          Manage Requests <ArrowRightIcon className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
};

export default function AdminRequestsHubClientPage({ stats }: { stats: RequestStats }) {
  return (
    <div className="space-y-8">
      
      {/* Section 1: Identity & Security */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Identity Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="NIN Modifications" 
            count={stats.ninMod} 
            href="/admin/requests/nin-modification" 
            icon={IdentificationIcon} 
            colorClass="blue" 
          />
          <RequestCard 
            title="NIN Delink" 
            count={stats.ninDelink} 
            href="/admin/requests/nin-delink" 
            icon={IdentificationIcon} 
            colorClass="indigo" 
          />
          <RequestCard 
            title="BVN Requests" 
            count={stats.bvn} 
            href="/admin/requests/bvn" 
            icon={ShieldCheckIcon} 
            colorClass="purple" 
          />
        </div>
      </div>

      {/* Section 2: Business & Tax */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Business & Corporate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="CAC Registrations" 
            count={stats.cac} 
            href="/admin/requests/cac" 
            icon={BriefcaseIcon} 
            colorClass="green" 
          />
          <RequestCard 
            title="TIN Services" 
            count={stats.tin} 
            href="/admin/requests/tin" 
            icon={DocumentTextIcon} 
            colorClass="teal" 
          />
           <RequestCard 
            title="Newspaper Ads" 
            count={stats.newspaper} 
            href="/admin/requests/newspaper" 
            icon={NewspaperIcon} 
            colorClass="gray" 
          />
        </div>
      </div>

      {/* Section 3: Education & Utility */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Education & Others</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="JAMB Services" 
            count={stats.jamb} 
            href="/admin/requests/jamb" 
            icon={AcademicCapIcon} 
            colorClass="orange" 
          />
          <RequestCard 
            title="Result Checkers" 
            count={stats.result} 
            href="/admin/requests/result" 
            icon={DocumentTextIcon} 
            colorClass="pink" 
          />
          <RequestCard 
            title="Failed VTU" 
            count={stats.vtu} 
            href="/admin/requests/vtu" 
            icon={PhoneIcon} 
            colorClass="red" 
          />
        </div>
      </div>

    </div>
  );
}
