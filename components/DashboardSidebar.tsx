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
  ChevronRightIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  IdentificationIcon,
  DevicePhoneMobileIcon,
  NewspaperIcon,
  ArrowUpCircleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type Props = {
  userRole: string; // We receive the role from the layout
};

export default function DashboardSidebar({ userRole }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(true); // Default open
  const pathname = usePathname(); 

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // --- Navigation Groups ---
  const mainLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: CreditCardIcon },
  ];

  const serviceLinks = [
    { name: 'NIN Services', href: '/dashboard/services/nin', icon: IdentificationIcon },
    { name: 'CAC Registration', href: '/dashboard/services/cac', icon: BriefcaseIcon },
    { name: 'JTB TIN Services', href: '/dashboard/services/tin', icon: DocumentTextIcon },
    { name: 'VTU & Bills', href: '/dashboard/services/vtu', icon: DevicePhoneMobileIcon },
    { name: 'Newspapers', href: '/dashboard/services/newspaper', icon: NewspaperIcon },
  ];

  const managementLinks = [
    { name: 'Transaction History', href: '/dashboard/history', icon: ClockIcon },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: UserCircleIcon },
  ];

  // --- Render Sidebar Content ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* 1. Logo Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-100">
        <SafeImage 
          src="/logos/logo.png" 
          alt="XP" 
          width={35} 
          height={35} 
          className="rounded-lg" 
          fallbackSrc="/logos/default.png"
        />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
            XPRESS POINT
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Agent Workspace
          </span>
        </div>
      </div>

      {/* 2. Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        
        {/* Group: Overview */}
        <div>
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Overview
          </p>
          <div className="space-y-1">
            {mainLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive(item.href) 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Group: Services (Dropdown) */}
        <div>
          <button
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            className="w-full flex items-center justify-between px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hover:text-gray-600 transition-colors"
          >
            <span>Services Hub</span>
            {isServicesOpen ? <ChevronDownIcon className="h-3 w-3" /> : <ChevronRightIcon className="h-3 w-3" />}
          </button>
          
          {isServicesOpen && (
            <div className="space-y-1 animate-in slide-in-from-top-2 duration-200">
              {serviceLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ml-2
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Group: Management (Refined) */}
        <div>
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Management
          </p>
          <div className="space-y-1">
            {managementLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive(item.href) 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* 3. Dynamic Bottom Action (The Upgrade/Tools Fix) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        {userRole === 'AGGREGATOR' ? (
          // --- View for Aggregators ---
          <Link 
            href="/dashboard/aggregator"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all active:scale-[0.98]"
          >
            <ShieldCheckIcon className="h-5 w-5" />
            Aggregator Tools
          </Link>
        ) : (
          // --- View for Agents ---
          <Link 
            href="/dashboard/upgrade"
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-blue-900 transition-all active:scale-[0.98]"
          >
            <ArrowUpCircleIcon className="h-5 w-5" />
            Upgrade Account
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <SafeImage src="/logos/logo.png" alt="Logo" width={30} height={30} fallbackSrc="/logos/default.png" className="rounded" />
          <span className="font-bold text-gray-900">XPRESS POINT</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button for Mobile */}
        <div className="absolute top-4 right-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <SidebarContent />
      </aside>
    </>
  );
}
