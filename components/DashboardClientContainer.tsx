"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  CreditCardIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowUpCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  PhoneIcon,
  NewspaperIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

// --- Helper: Sidebar Item Component ---
const SidebarItem = ({ 
  href, 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  isActive: boolean; 
  onClick: () => void 
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 
      ${isActive 
        ? 'bg-blue-50 text-blue-700 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
  >
    <Icon 
      className={`h-5 w-5 flex-shrink-0 transition-colors 
        ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
    />
    {label}
  </Link>
);

// --- Helper: Service Accordion Component ---
const ServiceAccordion = ({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  links,
  onLinkClick,
  pathname
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  links: { href: string; name: string }[];
  onLinkClick: () => void;
  pathname: string;
}) => {
  // Check if any child link is active to highlight the parent
  const isParentActive = links.some(link => pathname === link.href);

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group
          ${isParentActive || isOpen ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
        `}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${isParentActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
          <span>{title}</span>
        </div>
        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {/* Dropdown Content */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="pl-11 pr-2 space-y-1 py-1">
          {links.map((link) => {
            const isLinkActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onLinkClick}
                className={`block py-2 px-3 rounded-lg text-xs font-medium transition-colors border-l-2
                  ${isLinkActive 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
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
  const [openCategory, setOpenCategory] = useState<string | null>('nin'); // Default open one category

  const toggleCategory = (category: string) => {
    setOpenCategory(prev => (prev === category ? null : category));
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // --- Sidebar Content ---
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      
      {/* 1. Logo Section */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-gray-100">
        <SafeImage 
          src="/logos/logo.png" 
          alt="XP" 
          width={36} 
          height={36} 
          className="rounded-lg shadow-sm" 
          fallbackSrc="/logos/default.png"
        />
        <div className="flex flex-col">
          <span className="text-lg font-extrabold text-gray-900 tracking-tight leading-none">
            XPRESS POINT
          </span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
            Workspace
          </span>
        </div>
      </div>

      {/* 2. Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* Group: Main Menu */}
        <div>
          <p className="px-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          <div className="space-y-1">
            <SidebarItem 
              label="Dashboard" 
              href="/dashboard" 
              icon={HomeIcon} 
              isActive={pathname === '/dashboard'} 
              onClick={closeSidebar} 
            />
            <SidebarItem 
              label="Fund Wallet" 
              href="/dashboard/fund-wallet" 
              icon={CreditCardIcon} 
              isActive={pathname === '/dashboard/fund-wallet'} 
              onClick={closeSidebar} 
            />
          </div>
        </div>

        {/* Group: Services Hub */}
        <div>
          <p className="px-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
            Services Hub
          </p>
          <div className="space-y-1">
            <ServiceAccordion
              title="NIN Services"
              icon={IdentificationIcon}
              isOpen={openCategory === 'nin'}
              onToggle={() => toggleCategory('nin')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/nin/verify-by-nin', name: 'Verify (NIN)' },
                { href: '/dashboard/services/nin/verify-by-phone', name: 'Verify (Phone)' },
                { href: '/dashboard/services/nin/ipe-clearance', name: 'IPE Clearance' },
                { href: '/dashboard/services/nin/personalize', name: 'Personalization' },
                { href: '/dashboard/services/nin/validation', name: 'Validation' },
                { href: '/dashboard/services/nin/modification', name: 'Modification' },
              ]}
            />
             <ServiceAccordion
              title="CAC Services"
              icon={BriefcaseIcon}
              isOpen={openCategory === 'cac'}
              onToggle={() => toggleCategory('cac')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/cac', name: 'Register & Retrieve' },
              ]}
            />
            <ServiceAccordion
              title="JTB-TIN"
              icon={RectangleStackIcon}
              isOpen={openCategory === 'tin'}
              onToggle={() => toggleCategory('tin')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/tin', name: 'Registration' },
              ]}
            />
             <ServiceAccordion
              title="VTU & Bills"
              icon={PhoneIcon}
              isOpen={openCategory === 'vtu'}
              onToggle={() => toggleCategory('vtu')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/vtu', name: 'Airtime & Data' },
              ]}
            />
             <ServiceAccordion
              title="Exam Pins"
              icon={DocumentTextIcon}
              isOpen={openCategory === 'exam'}
              onToggle={() => toggleCategory('exam')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/exam', name: 'WAEC / NECO' },
              ]}
            />
             <ServiceAccordion
              title="Newspapers"
              icon={NewspaperIcon}
              isOpen={openCategory === 'news'}
              onToggle={() => toggleCategory('news')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/newspaper', name: 'Change of Name' },
              ]}
            />
             <ServiceAccordion
              title="BVN Services"
              icon={ShieldCheckIcon}
              isOpen={openCategory === 'bvn'}
              onToggle={() => toggleCategory('bvn')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/bvn', name: 'BVN Verification' },
              ]}
            />
             <ServiceAccordion
              title="JAMB Services"
              icon={AcademicCapIcon}
              isOpen={openCategory === 'jamb'}
              onToggle={() => toggleCategory('jamb')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/services/jamb/result', name: 'Original Result' },
                { href: '/dashboard/services/jamb/admission', name: 'Admission Letter' },
              ]}
            />
          </div>
        </div>

        {/* Group: Account */}
        <div>
          <p className="px-3 text-[11px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
            Account
          </p>
          <div className="space-y-1">
             <ServiceAccordion
              title="Service History"
              icon={ArchiveBoxIcon}
              isOpen={openCategory === 'history'}
              onToggle={() => toggleCategory('history')}
              pathname={pathname}
              onLinkClick={closeSidebar}
              links={[
                { href: '/dashboard/history/verification', name: 'Verifications' },
                { href: '/dashboard/history/modification', name: 'Modifications' },
                { href: '/dashboard/history/cac', name: 'CAC History' },
                { href: '/dashboard/history/tin', name: 'TIN History' },
              ]}
            />
            <SidebarItem 
              label="Transactions" 
              href="/dashboard/history" 
              icon={ClockIcon} 
              isActive={pathname === '/dashboard/history'} 
              onClick={closeSidebar} 
            />
            <SidebarItem 
              label="Profile" 
              href="/dashboard/profile" 
              icon={UserCircleIcon} 
              isActive={pathname === '/dashboard/profile'} 
              onClick={closeSidebar} 
            />
          </div>
        </div>
      </nav>

      {/* 3. Footer (Upgrade & Logout) */}
      <div className="p-4 border-t border-gray-200 bg-gray-50/50 space-y-3">
        {user.role === 'AGGREGATOR' ? (
           <Link 
             href="/dashboard/aggregator"
             onClick={closeSidebar}
             className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-purple-200 hover:bg-purple-700 hover:shadow-purple-300 transition-all active:scale-[0.98]"
           >
             <WrenchScrewdriverIcon className="h-5 w-5" />
             Aggregator Tools
           </Link>
        ) : (
           <Link 
             href="/dashboard/upgrade"
             onClick={closeSidebar}
             className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98]"
           >
             <ArrowUpCircleIcon className="h-5 w-5" />
             Upgrade Plan
           </Link>
        )}
        
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      
      {/* --- Desktop Sidebar (Fixed) --- */}
      <aside className="hidden w-72 flex-col border-r border-gray-200 bg-white lg:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar (Drawer) --- */}
      <div className={`fixed inset-0 z-50 flex lg:hidden ${isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeSidebar}
        />
        
        {/* Drawer */}
        <div 
          className={`relative flex w-72 flex-col bg-white h-full shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <button 
            className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
            onClick={closeSidebar}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <SidebarContent />
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-gray-200 bg-white px-6 lg:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <SafeImage src="/logos/logo.png" alt="Logo" width={30} height={30} className="rounded" fallbackSrc="/logos/default.png" />
            <span className="font-bold text-gray-900">XPRESS POINT</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
