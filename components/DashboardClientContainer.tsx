"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CreditCardIcon,
  ClockIcon,
  UserIcon,
  ArrowUpCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  IdentificationIcon, // NIN
  ShieldCheckIcon,    // BVN
  AcademicCapIcon,    // JAMB
  RectangleStackIcon, // TIN
  DocumentTextIcon,   // Exams
  BriefcaseIcon,      // CAC
  PhoneIcon,          // VTU
  NewspaperIcon,      // Newspaper
  ArchiveBoxIcon      // Service History
} from '@heroicons/react/24/outline';

// This type must match the user data we select in lib/auth.ts
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

// --- NEW: Helper Component for Accordion Links ---
// This prevents us from repeating the same complex code 8 times
const ServiceAccordion = ({
  title,
  icon: Icon,
  category,
  openCategory,
  toggleCategory,
  links,
  setIsSidebarOpen,
}: {
  title: string;
  icon: React.ElementType;
  category: string;
  openCategory: string | null;
  toggleCategory: (category: string) => void;
  links: { href: string; name: string }[];
  setIsSidebarOpen: (isOpen: boolean) => void;
}) => (
  <>
    <button
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${openCategory === category ? 'bg-gray-100' : ''}`}
      onClick={() => toggleCategory(category)}
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5" /> {title}
      </span>
      <ChevronDownIcon className={`h-4 w-4 transition-transform ${openCategory === category ? 'rotate-180' : ''}`} />
    </button>
    {openCategory === category && (
      <div className="ml-8 flex flex-col border-l border-gray-200 pl-4">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className="py-1.5 text-sm text-gray-600 hover:text-black" 
            onClick={() => setIsSidebarOpen(false)}
          >
            {link.name}
          </Link>
        ))}
      </div>
    )}
  </>
);


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

  // --- This is the Refurbished Sidebar Content ---
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="flex h-[70px] flex-shrink-0 items-center border-b border-gray-200 px-6">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900">
          XPRESS POINT
        </Link>
      </div>
      
      {/* Navigation */}
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

        {/* --- All Services Category --- */}
        <span className="mt-4 block px-4 py-2 text-xs font-semibold uppercase text-gray-400">
          All Services
        </span>

        {/* --- THIS IS THE FIX --- */}
        {/* All 8 Accordions are now added */}
        
        <ServiceAccordion
          title="NIN Services"
          icon={IdentificationIcon}
          category="nin"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '/dashboard/services/nin/verification', name: 'NIN Verification' },
            { href: '#', name: 'IPE Clearance' },
            { href: '#', name: 'Self Service Delink' },
            { href: '#', name: 'Personalize NIN' },
            { href: '#', name: 'Validation' },
            { href: '#', name: 'NIN Modification' },
          ]}
        />
        <ServiceAccordion
          title="BVN Services"
          icon={ShieldCheckIcon}
          category="bvn"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'BVN Verification' },
            { href: '#', name: 'BVN Retrieval' },
            { href: '#', name: 'BVN Modification' },
          ]}
        />
        <ServiceAccordion
          title="JAMB Services"
          icon={AcademicCapIcon}
          category="jamb"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'Original Result Slip' },
            { href: '#', name: 'Registration Slip' },
            { href: '#', name: 'Admission Letter' },
          ]}
        />
        <ServiceAccordion
          title="JTB-TIN"
          icon={RectangleStackIcon}
          category="tin"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'TIN Registration' },
            { href: '#', name: 'TIN Certificate' },
          ]}
        />
        <ServiceAccordion
          title="Exam Pins"
          icon={DocumentTextIcon}
          category="exam"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'WAEC PIN' },
            { href: '#', name: 'NECO PIN' },
            { href: '#', name: 'NABTEB PIN' },
          ]}
        />
        <ServiceAccordion
          title="CAC Services"
          icon={BriefcaseIcon}
          category="cac"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'Business Name' },
            { href: '#', name: 'Document Retrieval' },
          ]}
        />
        <ServiceAccordion
          title="VTU Services"
          icon={PhoneIcon}
          category="vtu"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'Buy Data' },
            { href: '#', name: 'Buy Airtime' },
            { href: '#', name: 'Pay Electricity' },
          ]}
        />
        <ServiceAccordion
          title="Newspaper"
          icon={NewspaperIcon}
          category="news"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '#', name: 'Change of Name' },
          ]}
        />
        
        {/* --- Management Category --- */}
        <span className="mt-4 block px-4 py-2 text-xs font-semibold uppercase text-gray-400">
          Management
        </span>

        {/* --- THIS IS THE FIX --- */}
        {/* Transaction History is now a simple link */}
        <Link
          href="/dashboard/history"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${isActive('/dashboard/history') ? 'bg-blue-50 text-blue-600' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <ClockIcon className="h-5 w-5" />
          Transaction History
        </Link>

        {/* NEW: Service History Accordion */}
        <button
          className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-100 ${openCategory === 'service-history' ? 'bg-gray-100' : ''}`}
          onClick={() => toggleCategory('service-history')}
        >
          <span className="flex items-center gap-3">
            <ArchiveBoxIcon className="h-5 w-5" /> Service History
          </span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${openCategory === 'service-history' ? 'rotate-180' : ''}`} />
        </button>
        {openCategory === 'service-history' && (
          <div className="ml-8 flex flex-col border-l border-gray-200 pl-4">
            <Link href="/dashboard/history/nin" className="py-1.5 text-sm text-gray-600 hover:text-black" onClick={() => setIsSidebarOpen(false)}>NIN History</Link>
            <Link href="/dashboard/history/vtu" className="py-1.5 text-sm text-gray-600 hover:text-black" onClick={() => setIsSidebarOpen(false)}>Data/Airtime History</Link>
            <Link href="/dashboard/history/exam" className="py-1.5 text-sm text-gray-600 hover:text-black" onClick={() => setIsSidebarOpen(false)}>Exam Pin History</Link>
          </div>
        )}

        {/* Profile Link */}
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
          <button 
            className="absolute top-4 right-4 z-10 text-gray-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
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
