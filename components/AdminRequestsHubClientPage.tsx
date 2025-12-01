"use client";

import React from 'react';
import Link from 'next/link';
import { 
  IdentificationIcon, 
  DevicePhoneMobileIcon, 
  UserIcon, 
  DocumentTextIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  NewspaperIcon,
  ShieldCheckIcon,
  CheckBadgeIcon // For Validation
} from '@heroicons/react/24/outline';

type Props = {
  stats: {
    ninMod: number;
    ninDelink: number;
    ninValidation: number; // <--- Added
    bvnRetrieval: number;
    bvnMod: number;
    bvnEnrollmentSetup: number;
    bvnNibss: number;
    cac: number;
    tin: number;
    jamb: number;
    result: number;
    newspaper: number;
    npc: number;
  };
};

// Reusable Card Component
const RequestCard = ({ title, count, href, icon: Icon, color }: any) => (
  <Link href={href} className="block group">
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all h-full relative overflow-hidden">
      {/* Background Icon Faded */}
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
        <Icon className="h-24 w-24" />
      </div>
      
      <div className="relative z-10">
        <div className={`p-3 rounded-lg w-fit mb-4 ${color.replace('text-', 'bg-').replace('600', '100')} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">Pending Requests</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">{count}</span>
          <span className="text-xs text-gray-400 font-medium">waiting</span>
        </div>
      </div>
    </div>
  </Link>
);

export default function AdminRequestsHubClientPage({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      
      {/* --- NIN Services --- */}
      <RequestCard 
        title="NIN Modification" 
        count={stats.ninMod} 
        href="/admin/requests/nin-modification" 
        icon={IdentificationIcon} 
        color="text-green-600" 
      />
      <RequestCard 
        title="NIN Delink" 
        count={stats.ninDelink} 
        href="/admin/requests/nin-delink" 
        icon={IdentificationIcon} 
        color="text-red-600" 
      />
      <RequestCard 
        title="NIN Validation" 
        count={stats.ninValidation} 
        href="/admin/requests/validation" 
        icon={CheckBadgeIcon} 
        color="text-blue-600" 
      />

      {/* --- BVN Services --- */}
      <RequestCard 
        title="BVN Retrieval" 
        count={stats.bvnRetrieval} 
        href="/admin/requests/bvn/retrieval" 
        icon={UserIcon} 
        color="text-purple-600" 
      />
      <RequestCard 
        title="BVN Modification" 
        count={stats.bvnMod} 
        href="/admin/requests/bvn/modification" 
        icon={UserIcon} 
        color="text-orange-600" 
      />
      <RequestCard 
        title="BVN Enrollment Setup" 
        count={stats.bvnEnrollmentSetup} 
        href="/admin/requests/bvn/enrollment/manage" 
        icon={DevicePhoneMobileIcon} 
        color="text-cyan-600" 
      />
      <RequestCard 
        title="VNIN to NIBSS" 
        count={stats.bvnNibss} 
        href="/admin/requests/bvn/nibss" 
        icon={ArrowPathIcon} // Using ArrowPathIcon (imported above but not in JSX?) let's ensure import
        color="text-teal-600" 
      />

      {/* --- Corporate Services --- */}
      <RequestCard 
        title="CAC Registration" 
        count={stats.cac} 
        href="/admin/requests/cac" 
        icon={BriefcaseIcon} 
        color="text-emerald-600" 
      />
      <RequestCard 
        title="TIN Services" 
        count={stats.tin} 
        href="/admin/requests/tin" 
        icon={DocumentTextIcon} 
        color="text-indigo-500" 
      />
      <RequestCard 
        title="Newspaper Pub." 
        count={stats.newspaper} 
        href="/admin/requests/newspaper" 
        icon={NewspaperIcon} 
        color="text-gray-600" 
      />

      {/* --- Education & Other --- */}
      <RequestCard 
        title="JAMB Services" 
        count={stats.jamb} 
        href="/admin/requests/jamb" 
        icon={AcademicCapIcon} 
        color="text-yellow-600" 
      />
      <RequestCard 
        title="Result Checker" 
        count={stats.result} 
        href="/admin/requests/result" 
        icon={AcademicCapIcon} 
        color="text-pink-600" 
      />
      <RequestCard 
        title="NPC Attestation" 
        count={stats.npc} 
        href="/admin/requests/npc" 
        icon={ShieldCheckIcon} 
        color="text-violet-600" 
      />

    </div>
  );
}

// Small Icon import fix for ArrowPathIcon if needed locally
import { ArrowPathIcon } from '@heroicons/react/24/outline';
