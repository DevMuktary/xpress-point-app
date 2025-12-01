"use client";

import React, { useState, useEffect } from 'react';
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
  RectangleStackIcon,
  Squares2X2Icon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type Props = {
  userRole: string;
};

export default function DashboardSidebar({ userRole }: Props) {
  const pathname = usePathname();
  
  // State for the main "Services Hub" folder
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  
  // State for specific sub-menus (like NIN)
  // We store the name of the currently open sub-menu
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  // Automatically open menus if the user is currently on a service page
  useEffect(() => {
    if (pathname?.startsWith('/dashboard/services')) {
      setIsServicesOpen(true);
      if (pathname.includes('/nin')) {
        setOpenSubMenu('NIN Services');
      }
    }
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // --- 1. Main Navigation ---
  const mainLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: CreditCardIcon },
  ];

  // --- 2. Services Navigation (Updated with NIN Sub-items) ---
  const serviceLinks = [
    { 
      name: 'NIN Services', 
      href: '/dashboard/services/nin', // keeping this as base
      icon: IdentificationIcon,
      // HERE ARE THE NEW ITEMS YOU WANTED
      subItems: [
        { name: 'Verify (NIN)', href: '/dashboard/services/nin/verify' },
        { name: 'Verify (Phone)', href: '/dashboard/services/nin/phone' },
        { name: 'IPE Clearance', href: '/dashboard/services/nin/ipe' },
        { name: 'Personalization', href: '/dashboard/services/nin/personalization' },
        { name: 'Validation', href: '/dashboard/services/nin/validation' },
        { name: 'Modification', href: '/dashboard/services/nin/modification' },
      ]
    },
    { name: 'BVN Services', href: '/dashboard/services/bvn', icon: ShieldCheckIcon },
    { name: 'JAMB Services', href: '/dashboard/services/jamb', icon: AcademicCapIcon },
    { name: 'JTB TIN Services', href: '/dashboard/services/tin', icon: DocumentTextIcon },
    { name: 'Result Checker', href: '/dashboard/services/exam-pins', icon: RectangleStackIcon },
    { name: 'CAC Registration', href: '/dashboard/services/cac', icon: BriefcaseIcon },
    { name: 'Newspapers', href: '/dashboard/services/newspaper', icon: NewspaperIcon },
    { name: 'VTU & Bills', href: '/dashboard/services/vtu', icon: DevicePhoneMobileIcon },
  ];

  // --- 3. Management Navigation ---
  const managementLinks = [
    { name: 'Transactions', href: '/dashboard/history', icon: ClockIcon },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: UserCircleIcon },
  ];

  // --- Helper: Toggle Logic ---
  const handleSubMenuClick = (name: string) => {
    if (openSubMenu === name) {
      setOpenSubMenu(null); // Close if already open
    } else {
      setOpenSubMenu(name); // Open this one
    }
  };

  // --- Helper Component for Standard Links ---
  const NavLink = ({ item, isChild = false }: { item: any, isChild?: boolean }) => {
    const active = isActive(item.href);
    
    // If this item has sub-items (Like NIN), render a Dropdown Button instead of a Link
    if (item.subItems) {
      const isOpen = openSubMenu === item.name;
      const isParentActive = pathname?.startsWith(item.href);

      return (
        <div className="flex flex-col">
          <button
            onClick={() => handleSubMenuClick(item.name)}
            className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
              ${isParentActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
              } ${isChild ? 'ml-2' : ''}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${isParentActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
            </div>
            <ChevronRightIcon className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Render the Children (Verify, IPE, etc.) */}
          {isOpen && (
            <div className="flex flex-col mt-1 ml-6 space-y-1 border-l-2 border-gray-100 pl-2">
              {item.subItems.map((sub: any) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className={`block px-3 py-2 text-xs font-medium rounded-lg transition-colors
                    ${pathname === sub.href 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Standard Link (No sub-items)
    return (
      <Link
        href={item.href}
        className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
          ${active 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
          } ${isChild ? 'ml-2' : ''}`}
      >
        <item.icon 
          className={`h-5 w-5 flex-shrink-0 transition-colors duration-200
            ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} 
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
      
      {/* --- A. Header / Logo Area --- */}
      <div className="flex items-center gap-3 px-6 h-24 flex-shrink-0 border-b border-gray-50">
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
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
        
        {/* Section: Overview */}
        <div>
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Main
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
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 mb-1
              ${isServicesOpen || pathname?.startsWith('/dashboard/services') 
                ? 'bg-blue-50 text-blue-800' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <Squares2X2Icon className={`h-5 w-5 ${isServicesOpen ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>Services Hub</span>
            </div>
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out space-y-1
            ${isServicesOpen ? 'max-h-[1200px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
          >
            {serviceLinks.map((item) => (
              <NavLink key={item.name} item={item} isChild={true} />
            ))}
          </div>
        </div>

        {/* Section: Management */}
        <div>
          <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Settings
          </p>
          <div className="space-y-1">
            {managementLinks.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* --- C. Footer / Action Area --- */}
      <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
        
        {userRole === 'AGGREGATOR' ? (
          <Link 
            href="/dashboard/aggregator"
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-gray-200 hover:bg-black transition-all active:scale-[0.98]"
          >
            <WrenchScrewdriverIcon className="h-5 w-5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span>Aggregator Tools</span>
          </Link>
        ) : (
          <Link 
            href="/dashboard/upgrade"
            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-[0.98]"
          >
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ArrowUpCircleIcon className="h-5 w-5 animate-bounce-slow" />
            <span>Upgrade Account</span>
          </Link>
        )}
        
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
