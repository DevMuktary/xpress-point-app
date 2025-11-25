"use client";

import React from 'react';
import Link from 'next/link';
import {
  IdentificationIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  NewspaperIcon,
  ArrowRightIcon,
  UserCircleIcon,
  XCircleIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

type RequestStats = {
  ninMod: number;
  ninDelink: number;
  ipe: number;
  personalization: number;
  
  bvnRetrieval: number;
  bvnMod: number;
  bvnEnrollment: number;
  bvnNibss: number;

  jamb: number;
  tin: number;
  result: number;
  cac: number;
  newspaper: number;
};

// --- Helper: The Request Card ---
const RequestCard = ({ 
  title, 
  count, 
  href, 
  icon: Icon, 
  subtext
}: { 
  title: string; 
  count: number; 
  href: string; 
  icon: React.ElementType; 
  subtext: string;
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
        <p className="text-xs text-gray-500 mt-1 font-medium">{subtext}</p>
        
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
      
      {/* 1. Identity Services (NIN) */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          NIN Services (Manual)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="NIN Modification" 
            count={stats.ninMod} 
            href="/admin/requests/nin-modification" 
            icon={UserCircleIcon} 
            subtext="Name, DOB, Phone Corrections"
          />
          <RequestCard 
            title="Self Service Delink" 
            count={stats.ninDelink} 
            href="/admin/requests/nin-delink" 
            icon={XCircleIcon} 
            subtext="NIN Number Delinking"
          />
          <RequestCard 
            title="IPE Clearance" 
            count={stats.ipe} 
            href="/admin/requests/ipe-clearance" 
            icon={ShieldCheckIcon} 
            subtext="IPE Clearing Process"
          />
          <RequestCard 
            title="Personalization" 
            count={stats.personalization} 
            href="/admin/requests/personalization" 
            icon={FingerPrintIcon} 
            subtext="NIN ID Card Printing"
          />
        </div>
      </section>

      {/* 2. BVN Services (Broken Down) */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          BVN Services (Manual)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RequestCard 
            title="BVN Retrieval" 
            count={stats.bvnRetrieval} 
            href="/admin/requests/bvn/retrieval" 
            icon={MagnifyingGlassIcon} 
            subtext="Phone & CRM Retrieval"
          />
          <RequestCard 
            title="BVN Modification" 
            count={stats.bvnMod} 
            href="/admin/requests/bvn/modification" 
            icon={UserCircleIcon} 
            subtext="Name, DOB, Phone Changes"
          />
          <RequestCard 
            title="Android Enrollment" 
            count={stats.bvnEnrollment} 
            href="/admin/requests/bvn/enrollment" 
            icon={DevicePhoneMobileIcon} 
            subtext="New Enrollment Processing"
          />
          <RequestCard 
            title="VNIN to NIBSS" 
            count={stats.bvnNibss} 
            href="/admin/requests/bvn/nibss" 
            icon={GlobeAltIcon} 
            subtext="Validation to NIBSS"
          />
        </div>
      </section>

      {/* 3. General Business & Education */}
      <section>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          General & Education Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RequestCard 
            title="CAC Services" 
            count={stats.cac} 
            href="/admin/requests/cac" 
            icon={BriefcaseIcon} 
            subtext="Registration & Retrieval"
          />
          <RequestCard 
            title="TIN Services" 
            count={stats.tin} 
            href="/admin/requests/tin" 
            icon={DocumentTextIcon} 
            subtext="JTB Registration & Retrieval"
          />
           <RequestCard 
            title="Newspaper Services" 
            count={stats.newspaper} 
            href="/admin/requests/newspaper" 
            icon={NewspaperIcon} 
            subtext="Change of Name Publication"
          />
          <RequestCard 
            title="JAMB Services" 
            count={stats.jamb} 
            href="/admin/requests/jamb" 
            icon={AcademicCapIcon} 
            subtext="Slip Printing & Profile Code"
          />
          <RequestCard 
            title="Result Checkers" 
            count={stats.result} 
            href="/admin/requests/result" 
            icon={DocumentTextIcon} 
            subtext="Request Result (Manual)"
          />
        </div>
      </section>

    </div>
  );
}
