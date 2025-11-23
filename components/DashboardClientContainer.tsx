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
  IdentificationIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  PhoneIcon,
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon // Icon for Aggregator Tools
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage'; // Ensure you have this component

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

// --- Helper Component for Accordion Links ---
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
        <Icon className="h-5 w-5 text-gray-500" /> {title}
      </span>
      <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${openCategory === category ? 'rotate-180' : ''}`} />
    </button>
    {openCategory === category && (
      <div className="ml-8 flex flex-col border-l border-gray-200 pl-4 mt-1 space-y-1">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            className="py-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors block" 
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

  // --- Sidebar Content ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex h-20 flex-shrink-0 items-center gap-3 border-b border-gray-100 px-6">
        <SafeImage 
          src="/logos/logo.png" 
          alt="XP" 
          width={32} 
          height={32} 
          className="rounded-md" 
          fallbackSrc="/logos/default.png"
        />
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          XPRESS POINT
        </span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        
        <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Overview
        </p>
        
        {/* Main Links */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium transition-all ${isActive('/dashboard') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <HomeIcon className={`h-5 w-5 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
          Dashboard
        </Link>
        <Link
          href="/dashboard/fund-wallet"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium transition-all ${isActive('/dashboard/fund-wallet') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <CreditCardIcon className={`h-5 w-5 ${isActive('/dashboard/fund-wallet') ? 'text-blue-600' : 'text-gray-500'}`} />
          Fund Wallet
        </Link>

        {/* --- Services Section --- */}
        <p className="mt-6 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Services Hub
        </p>
        
        <ServiceAccordion
          title="NIN Services"
          icon={IdentificationIcon}
          category="nin"
          openCategory={openCategory}
          toggleCategory={toggleCategory}
          setIsSidebarOpen={setIsSidebarOpen}
          links={[
            { href: '/dashboard/services/nin/verify-by-nin', name: 'NIN Verification (NIN)' },
            { href: '/dashboard/services/nin/verify-by-phone', name: 'NIN Verification (Phone)' },
            { href: '/dashboard/services/nin/ipe-clearance', name: 'IPE Clearance' },
            { href: '/dashboard/services/nin/personalize', name: 'Personalization' },
            { href: '/dashboard/services/nin/validation', name: 'Validation' },
            { href: '/dashboard/services/nin/modification', name: 'Modification' },
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
            { href: '/dashboard/services/bvn', name: 'BVN Verification' },
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
            { href: '/dashboard/services/jamb/result', name: 'Original Result Slip' },
            { href: '/dashboard/services/jamb/admission', name: 'Admission Letter' },
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
            { href: '/dashboard/services/tin', name: 'TIN Services' },
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
            { href: '/dashboard/services/exam', name: 'Buy Pins (WAEC/NECO)' },
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
            { href: '/dashboard/services/cac', name: 'Registration & Retrieval' },
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
            { href: '/dashboard/services/vtu', name: 'Airtime & Data' },
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
            { href: '/dashboard/services/newspaper', name: 'Change of Name' },
          ]}
        />
        
        {/* --- Management Section (Cleaned) --- */}
        <p className="mt-6 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Management
        </p>

        <Link
          href="/dashboard/history"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium transition-all ${isActive('/dashboard/history') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <ClockIcon className={`h-5 w-5 ${isActive('/dashboard/history') ? 'text-blue-600' : 'text-gray-500'}`} />
          Transaction History
        </Link>

        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium transition-all ${isActive('/dashboard/profile') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => setIsSidebarOpen(false)}
        >
          <UserIcon className={`h-5 w-5 ${isActive('/dashboard/profile') ? 'text-blue-600' : 'text-gray-500'}`} />
          Profile
        </Link>
      </nav>
      
      {/* --- Sidebar Footer --- */}
      <div className="space-y-3 border-t border-gray-200 p-4 bg-gray-50/50">
        
        {/* Dynamic Button: Aggregator Tools vs Upgrade */}
        {user.role === 'AGGREGATOR' ? (
           <Link 
             href="/dashboard/aggregator"
             onClick={() => setIsSidebarOpen(false)}
             className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-purple-700 transition-all active:scale-[0.98]"
           >
             <WrenchScrewdriverIcon className="h-5 w-5" />
             Aggregator Tools
           </Link>
        ) : (
           <Link 
             href="/dashboard/upgrade"
             onClick={() => setIsSidebarOpen(false)}
             className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all active:scale-[0.98]"
           >
             <ArrowUpCircleIcon className="h-5 w-5" />
             Upgrade to Aggregator
           </Link>
        )}
        
        {/* Logout Button */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white lg:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar (Slide-in) --- */}
      <div className={`fixed inset-0 z-50 flex lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Content */}
        <div className="relative flex w-72 flex-col bg-white h-full shadow-2xl">
          <button 
            className="absolute top-4 right-4 z-10 p-1 bg-gray-100 rounded-full text-gray-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <SidebarContent />
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-gray-200 bg-white px-6 lg:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <SafeImage src="/logos/logo.png" alt="Logo" width={28} height={28} className="rounded" fallbackSrc="/logos/default.png" />
            <span className="font-bold text-gray-900">XPRESS POINT</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
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
