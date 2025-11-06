"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CreditCardIcon,
  CogIcon,
  ClockIcon,
  UserIcon,
  ArrowUpCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// This type must match the user data we select in lib/auth.ts
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export default function DashboardClientContainer({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const isActive = (path: string) => pathname === path;

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // This is the actual sidebar content
  const SidebarContent = () => (
    <>
      <div className="flex h-[70px] items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          XPRESS POINT
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Links */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <HomeIcon className="h-5 w-5" />
          Dashboard
        </Link>
        <Link
          href="/dashboard/fund-wallet"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${isActive('/dashboard/fund-wallet') ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <CreditCardIcon className="h-5 w-5" />
          Fund Wallet
        </Link>

        {/* Category Title */}
        <span className="mt-4 block px-4 py-2 text-xs font-semibold uppercase text-gray-400">
          All Services
        </span>

        {/* Accordion for NIN */}
        <button
          className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100"
          onClick={() => toggleCategory('nin')}
        >
          <span className="flex items-center gap-3">
            <CogIcon className="h-5 w-5" /> NIN Services
          </span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${openCategory === 'nin' ? 'rotate-180' : ''}`} />
        </button>
        {openCategory === 'nin' && (
          <div className="ml-8 flex flex-col">
            <Link href="/dashboard/services/nin-verification" className="py-1.5 text-sm text-gray-600 hover:text-black">NIN Verification</Link>
            <Link href="#" className="py-1.5 text-sm text-gray-600 hover:text-black">IPE Clearance</Link>
          </div>
        )}

        {/* (Add other accordions here) */}

        {/* Other Links */}
        <Link
          href="/dashboard/history"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${isActive('/dashboard/history') ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <ClockIcon className="h-5 w-5" />
          History
        </Link>
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${isActive('/dashboard/profile') ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <UserIcon className="h-5 w-5" />
          Profile
        </Link>
      </nav>
      {/* Sidebar Footer */}
      <div className="border-t border-gray-200 p-4">
        <Link href="/dashboard/upgrade" className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition-all hover:bg-blue-700">
          <ArrowUpCircleIcon className="h-5 w-5" />
          Upgrade to Aggregator
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar (Slide-in) --- */}
      <div className={`fixed inset-0 z-50 flex lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50" 
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Content */}
        <div className="relative flex w-64 flex-col bg-white">
          <SidebarContent />
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1">
        {/* Mobile Header */}
        <header className="flex h-[70px] items-center justify-between border-b border-gray-200 bg-white px-6 lg:hidden">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            XPRESS POINT
          </Link>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6 text-gray-900" />
          </button>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
