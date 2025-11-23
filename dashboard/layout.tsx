"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  WalletIcon, 
  ClockIcon, 
  UserCircleIcon, 
  RocketLaunchIcon, 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  ChevronRightIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  IdentificationIcon,
  DevicePhoneMobileIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(true); // Default open to show options
  const pathname = usePathname(); // To check active page

  // --- Menu Configuration ---
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: WalletIcon },
    { name: 'Transaction History', href: '/dashboard/history', icon: ClockIcon },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: UserCircleIcon },
  ];

  const serviceItems = [
    { name: 'NIN Services', href: '/dashboard/services/nin', icon: IdentificationIcon },
    { name: 'CAC Registration', href: '/dashboard/services/cac', icon: BriefcaseIcon },
    { name: 'JTB TIN Services', href: '/dashboard/services/tin', icon: DocumentTextIcon },
    { name: 'VTU & Bills', href: '/dashboard/services/vtu', icon: DevicePhoneMobileIcon },
    { name: 'Newspapers', href: '/dashboard/services/newspaper', icon: NewspaperIcon },
  ];

  // --- Helper: Check if link is active ---
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // --- Sidebar Component ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-100">
        <SafeImage 
          src="/logos/logo.png" 
          alt="XpressPoint" 
          width={32} 
          height={32} 
          className="rounded-md" 
          fallbackSrc="/logos/default.png"
        />
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          XPRESS POINT
        </span>
      </div>

      {/* Scrollable Nav Area */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        
        {/* Main Menu */}
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsSidebarOpen(false)} // Close mobile menu on click
            className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
              ${isActive(item.href) 
                ? 'bg-blue-50 text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <item.icon 
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors
                ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
            />
            {item.name}
          </Link>
        ))}

        {/* Services Dropdown Section */}
        <div className="pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
          >
            <span>Available Services</span>
            {isServicesOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </button>

          {/* Dropdown Items */}
          {isServicesOpen && (
            <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {serviceItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`group flex items-center px-3 py-2 pl-5 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon 
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors
                      ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom: Upgrade Button & User Profile */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50">
        <Link 
          href="/dashboard/upgrade"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95"
        >
          <RocketLaunchIcon className="h-4 w-4" />
          Upgrade Account
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* --- Mobile Sidebar Overlay --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- Sidebar Navigation (Fixed on Desktop, Sliding on Mobile) --- */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <SafeImage src="/logos/logo.png" alt="Logo" width={28} height={28} fallbackSrc="/logos/default.png" className="rounded" />
            <span className="font-bold text-gray-900">XPRESS POINT</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
