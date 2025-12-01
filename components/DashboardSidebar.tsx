"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  CreditCardIcon, 
  ClockIcon, 
  UserCircleIcon, 
  ChevronDownIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  IdentificationIcon,
  DevicePhoneMobileIcon,
  NewspaperIcon,
  ArrowUpCircleIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  WrenchScrewdriverIcon,
  ArrowRightOnRectangleIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type Props = {
  userRole: string;
};

export default function DashboardSidebar({ userRole }: Props) {
  const [isServicesOpen, setIsServicesOpen] = useState(true); 
  const pathname = usePathname(); 

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // --- 1. Main Navigation ---
  const mainLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: CreditCardIcon },
  ];

  // --- 2. Services Navigation (Expanded) ---
  const serviceLinks = [
    { name: 'NIN Services', href: '/dashboard/services/nin', icon: IdentificationIcon },
    { name: 'BVN Services', href: '/dashboard/services/bvn', icon: ShieldCheckIcon },
    { name: 'JAMB Services', href: '/dashboard/services/jamb', icon: AcademicCapIcon },
    { name: 'JTB TIN Services', href: '/dashboard/services/tin', icon: DocumentTextIcon },
    { name: 'Result Checker', href: '/dashboard/services/exam-pins', icon: RectangleStackIcon }, // WAEC/NECO/NABTEB
    { name: 'CAC Registration', href: '/dashboard/services/cac', icon: BriefcaseIcon },
    { name: 'Newspapers', href: '/dashboard/services/newspaper', icon: NewspaperIcon },
    { name: 'VTU & Bills', href: '/dashboard/services/vtu', icon: DevicePhoneMobileIcon },
  ];

  // --- 3. Management Navigation ---
  const managementLinks = [
    { name: 'Transactions', href: '/dashboard/history', icon: ClockIcon },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: UserCircleIcon },
  ];

  // --- Helper Component for Links ---
  const NavLink = ({ item, onClick }: { item: any, onClick?: () => void }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300
          ${active 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 translate-x-1' 
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:translate-x-1'
          }`}
      >
        <item.icon 
          className={`h-5 w-5 flex-shrink-0 transition-colors duration-300
            ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} 
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
      
      {/* --- A. Header / Logo Area --- */}
      <div className="flex items-center gap-3 px-6 h-24 flex-shrink-0">
        <div className="relative h-10 w-10 overflow-hidden rounded-xl shadow-sm border border-gray-100">
           <SafeImage 
            src="/logos/logo.png" 
            alt="XP" 
            fill
            className="object-cover"
            fallbackSrc="/logos/default.png"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-gray-900 tracking-tight leading-none">
            XPRESS<span className="text-blue-600">POINT</span>
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {userRole} WORKSPACE
          </span>
        </div>
      </div>

      {/* --- B. Scrollable Navigation --- */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-8 scrollbar-hide">
        
        {/* Section: Overview */}
        <div>
          <p className="px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            Overview
          </p>
          <div className="space-y-1">
            {mainLinks.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Section: Services Hub (Collapsible) */}
        <div>
          <button
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            className="w-full flex items-center justify-between px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 hover:text-blue-600 transition-colors"
          >
            <span>Services Hub</span>
            <span className={`transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`}>
              <ChevronDownIcon className="h-3 w-3" />
            </span>
          </button>
          
          <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isServicesOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {serviceLinks.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>

        {/* Section: Management */}
        <div>
          <p className="px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
            Account
          </p>
          <div className="space-y-1">
            {managementLinks.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* --- C. Footer / Action Area --- */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/30 space-y-3">
        
        {/* Dynamic Role-Based Button */}
        {userRole === 'AGGREGATOR' ? (
          <Link 
            href="/dashboard/aggregator"
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-[0.98]"
          >
            <WrenchScrewdriverIcon className="h-5 w-5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span>Aggregator Tools</span>
          </Link>
        ) : (
          <Link 
            href="/dashboard/upgrade"
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ArrowUpCircleIcon className="h-5 w-5 animate-bounce-slow" />
            <span>Upgrade Account</span>
          </Link>
        )}
        
        {/* Logout Button */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:border-red-100 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
