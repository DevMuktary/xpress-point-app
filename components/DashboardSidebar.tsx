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
  ChevronRightIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type Props = {
  userRole: string;
};

export default function DashboardSidebar({ userRole }: Props) {
  const pathname = usePathname();
  
  // State for the main "Services Hub" folder
  const [isServicesOpen, setIsServicesOpen] = useState(true); // Default open for better UX
  
  // State for specific sub-menus
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  // --- Auto-Open Menu based on Active Route ---
  useEffect(() => {
    if (pathname) {
      if (pathname.includes('/nin')) setOpenSubMenu('NIN Services');
      else if (pathname.includes('/bvn')) setOpenSubMenu('BVN Services');
      else if (pathname.includes('/jamb')) setOpenSubMenu('JAMB Services');
      else if (pathname.includes('/exam-pins')) setOpenSubMenu('Exam Pins');
      else if (pathname.includes('/vtu')) setOpenSubMenu('VTU & Bills');
      else if (pathname.includes('/cac')) setOpenSubMenu('CAC Registration');
      else if (pathname.includes('/tin')) setOpenSubMenu('Tax (TIN)');
      else if (pathname.includes('/newspaper')) setOpenSubMenu('Newspaper');
      else if (pathname.includes('/npc')) setOpenSubMenu('NPC Services');
    }
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // --- 1. Main Navigation ---
  const mainLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Fund Wallet', href: '/dashboard/fund-wallet', icon: CreditCardIcon },
  ];

  // --- 2. Services Navigation (ALL COLLAPSIBLE) ---
  const serviceLinks = [
    { 
      name: 'NIN Services', 
      href: '/dashboard/services/nin', 
      icon: IdentificationIcon,
      subItems: [
        { name: 'Verify by NIN', href: '/dashboard/services/nin/verify-by-nin' },
        { name: 'Verify by Phone', href: '/dashboard/services/nin/verify-by-phone' },
        { name: 'IPE Clearance', href: '/dashboard/services/nin/ipe-clearance' },
        { name: 'Personalization', href: '/dashboard/services/nin/personalize' },
        { name: 'Validation', href: '/dashboard/services/nin/validation' },
        { name: 'Modification', href: '/dashboard/services/nin/modification' },
        { name: 'Print VNIN Slip', href: '/dashboard/services/nin/vnin-slip' },
        { name: 'NIN Delink', href: '/dashboard/services/nin/delink' },
      ]
    },
    { 
      name: 'BVN Services', 
      href: '/dashboard/services/bvn', 
      icon: ShieldCheckIcon,
      subItems: [
        { name: 'BVN Verification', href: '/dashboard/services/bvn/verification' },
        { name: 'BVN Retrieval', href: '/dashboard/services/bvn/retrieval' },
        { name: 'BVN Modification', href: '/dashboard/services/bvn/modification' },
        { name: 'BVN Enrollment', href: '/dashboard/services/bvn/enrollment' },
        { name: 'VNIN to NIBSS', href: '/dashboard/services/bvn/vnin-to-nibss' },
      ]
    },
    { 
      name: 'JAMB Services', 
      href: '/dashboard/services/jamb', 
      icon: AcademicCapIcon,
      subItems: [
        { name: 'Profile Code', href: '/dashboard/services/jamb/profile-code' },
        { name: 'Print Slips', href: '/dashboard/services/jamb/slips' },
        { name: 'History', href: '/dashboard/history/jamb' },
      ]
    },
    { 
      name: 'Exam Pins', 
      href: '/dashboard/services/exam-pins', 
      icon: RectangleStackIcon,
      subItems: [
        { name: 'WAEC Pins', href: '/dashboard/services/exam-pins/waec' },
        { name: 'NECO Pins', href: '/dashboard/services/exam-pins/neco' },
        { name: 'NABTEB Pins', href: '/dashboard/services/exam-pins/nabteb' },
        { name: 'Purchase History', href: '/dashboard/history/exam-pins' },
      ]
    },
    { 
      name: 'VTU & Bills', 
      href: '/dashboard/services/vtu', 
      icon: DevicePhoneMobileIcon,
      subItems: [
        { name: 'Buy Airtime', href: '/dashboard/services/vtu/airtime' },
        { name: 'Buy Data', href: '/dashboard/services/vtu/data' },
        { name: 'Transaction History', href: '/dashboard/history/vtu' },
      ]
    },
    { 
      name: 'CAC Registration', 
      href: '/dashboard/services/cac', 
      icon: BriefcaseIcon,
      subItems: [
        { name: 'New Application', href: '/dashboard/services/cac' },
        { name: 'Application History', href: '/dashboard/history/cac' },
      ]
    },
    { 
      name: 'Tax (TIN)', 
      href: '/dashboard/services/tin', 
      icon: DocumentTextIcon,
      subItems: [
        { name: 'New Application', href: '/dashboard/services/tin' },
        { name: 'Application History', href: '/dashboard/history/tin' },
      ]
    },
    { 
      name: 'Newspaper', 
      href: '/dashboard/services/newspaper', 
      icon: NewspaperIcon,
      subItems: [
        { name: 'New Publication', href: '/dashboard/services/newspaper' },
        { name: 'Request History', href: '/dashboard/history/newspaper' },
      ]
    },
    { 
      name: 'NPC Services', 
      href: '/dashboard/services/npc', 
      icon: BuildingLibraryIcon,
      subItems: [
        { name: 'Birth Attestation', href: '/dashboard/services/npc' },
        { name: 'History', href: '/dashboard/history/npc' },
      ]
    },
  ];

  // --- 3. Management Navigation ---
  const managementLinks = [
    { name: 'Transactions', href: '/dashboard/history', icon: ClockIcon },
    { name: 'Profile Settings', href: '/dashboard/profile', icon: UserCircleIcon },
  ];

  // --- Toggle Logic ---
  const handleSubMenuClick = (name: string) => {
    // If clicking the same one, toggle it off. Else open the new one.
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  // --- Nav Item Component ---
  const NavLink = ({ item, isChild = false }: { item: any, isChild?: boolean }) => {
    // If item has subItems, it acts as an Accordion Button
    if (item.subItems) {
      const isOpen = openSubMenu === item.name;
      // Check if any child is active to highlight the parent
      const isParentActive = item.subItems.some((sub: any) => isActive(sub.href));

      return (
        <div className="flex flex-col">
          <button
            onClick={() => handleSubMenuClick(item.name)}
            className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full
              ${isParentActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-blue-700'
              } ${isChild ? 'ml-2' : ''}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className={`h-5 w-5 ${isParentActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.name}
            </div>
            <ChevronRightIcon className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Sub-Menu Items */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out border-l-2 border-gray-100 ml-6
            ${isOpen ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
          >
            {item.subItems.map((sub: any) => {
              const isSubActive = pathname === sub.href;
              return (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className={`block px-4 py-2 text-xs font-medium rounded-r-lg transition-colors mb-1
                    ${isSubActive 
                      ? 'text-blue-700 bg-blue-50/50 border-l-2 border-blue-600 -ml-[2px]' 
                      : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }

    // Standard Link
    const active = isActive(item.href);
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
              ${isServicesOpen 
                ? 'bg-gray-50 text-gray-900' 
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
            ${isServicesOpen ? 'max-h-[2000px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
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
