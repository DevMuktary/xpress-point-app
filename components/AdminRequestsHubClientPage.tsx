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
  ArrowRightIcon,
  UserCircleIcon,
  FingerPrintIcon,
  CheckBadgeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

type RequestStats = {
  ninMod: number;
  ninDelink: number;
  ninValidation: number;
  ipe: number;
  personalization: number;
  bvn: number;
  cac: number;
  tin: number;
  jamb: number;
  result: number;
  newspaper: number;
};

// --- Helper: The Request Card ---
const RequestCard = ({ 
  title, 
  count, 
  href, 
  icon: Icon, 
  colorClass // kept for future styling flexibility
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
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-start">
        {/* Icon Area */}
        <div className={`p-3 rounded-xl transition-colors ${hasPending ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
          <Icon className="h-8 w-8" />
        </div>

        {/* Count Badge */}
        <span 
          className={`flex items-center justify-center min-w-[2.5rem] h-8 px-2 rounded-full text-sm font-bold shadow-sm transition-all
            ${hasPending 
              ? 'bg-red-600 text-white animate-pulse' 
              : 'bg-gray-100 text-gray-500'
            }`}
        >
          {count}
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">Manage pending items</p>
        
        <div className="flex items-center gap-2 mt-4 text-sm font-medium text-blue-600 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          View Requests <ArrowRightIcon className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
};

export default function AdminRequestsHubClientPage({ stats }: { stats: RequestStats }) {
  return (
    <div className="space-y-10">
      
      {/* 1. Identity Services */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Identity Management (NIMC)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="NIN Modifications" 
            count={stats.ninMod} 
            href="/admin/requests/nin-modification" 
            icon={UserCircleIcon} 
            colorClass="blue" 
          />
          <RequestCard 
            title="NIN Delink" 
            count={stats.ninDelink} 
            href="/admin/requests/nin-delink" 
            icon={XCircleIcon} 
            colorClass="indigo" 
          />
          <RequestCard 
            title="NIN Validations" 
            count={stats.ninValidation} 
            href="/admin/requests/nin-validation" 
            icon={CheckBadgeIcon} 
            colorClass="green" 
          />
          <RequestCard 
            title="IPE Clearance" 
            count={stats.ipe} 
            href="/admin/requests/ipe-clearance" 
            icon={ShieldCheckIcon} 
            colorClass="teal" 
          />
          <RequestCard 
            title="Personalization" 
            count={stats.personalization} 
            href="/admin/requests/personalization" 
            icon={FingerPrintIcon} 
            colorClass="orange" 
          />
        </div>
      </section>

      {/* 2. Financial & Business */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Business & Financial
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="BVN Services" 
            count={stats.bvn} 
            href="/admin/requests/bvn" 
            icon={IdentificationIcon} 
            colorClass="purple" 
          />
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
            colorClass="blue" 
          />
           <RequestCard 
            title="Newspaper Ads" 
            count={stats.newspaper} 
            href="/admin/requests/newspaper" 
            icon={NewspaperIcon} 
            colorClass="gray" 
          />
        </div>
      </section>

      {/* 3. Education */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Education
        </h2>
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
        </div>
      </section>

    </div>
  );
}


