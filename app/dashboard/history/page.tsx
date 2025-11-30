import React from 'react';
import Link from 'next/link';
import { 
  ChevronRightIcon, 
  ClockIcon, 
  CreditCardIcon,
  IdentificationIcon,
  ShieldCheckIcon, // Used for NPC
  DocumentTextIcon,
  BriefcaseIcon,
  NewspaperIcon,
  AcademicCapIcon,
  PhoneIcon,
  UserCircleIcon,
  LinkIcon,
  FingerPrintIcon,
  CheckBadgeIcon,
  RectangleStackIcon,
  MagnifyingGlassIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// --- Types ---
type HistoryLink = {
  title: string;
  href: string;
  icon: React.ElementType;
  colorClass: string;
  description: string;
};

type HistorySection = {
  category: string;
  items: HistoryLink[];
};

export default function HistoryHubPage() {
  
  // --- Configuration ---
  const historySections: HistorySection[] = [
    {
      category: "Financials",
      items: [
        {
          title: "Wallet Transactions",
          href: "/dashboard/history/wallet",
          icon: CreditCardIcon,
          colorClass: "bg-blue-100 text-blue-600",
          description: "Deposits & Charges"
        }
      ]
    },
    {
      category: "NIN Services History",
      items: [
        {
          title: "NIN Verification",
          href: "/dashboard/history/verification",
          icon: DocumentTextIcon,
          colorClass: "bg-indigo-100 text-indigo-600",
          description: "View generated slips"
        },
        {
          title: "NIN Modification",
          href: "/dashboard/history/modification",
          icon: UserCircleIcon,
          colorClass: "bg-indigo-100 text-indigo-600",
          description: "Name, DOB, Phone changes"
        },
        {
          title: "Self Service Delink",
          href: "/dashboard/history/delink",
          icon: LinkIcon,
          colorClass: "bg-indigo-100 text-indigo-600",
          description: "Email delinking status"
        },
        // Adding Personalization here as it fits NIN category often
        {
          title: "NIN Personalization",
          href: "/dashboard/history/personalization",
          icon: FingerPrintIcon,
          colorClass: "bg-indigo-100 text-indigo-600",
          description: "Tracking ID status"
        },
         {
          title: "IPE Clearance",
          href: "/dashboard/history/ipe",
          icon: ShieldCheckIcon,
          colorClass: "bg-indigo-100 text-indigo-600",
          description: "Clearance status"
        }
      ]
    },
    {
      category: "BVN Services History",
      items: [
        {
          title: "BVN Retrieval",
          href: "/dashboard/history/bvn/retrieval",
          icon: MagnifyingGlassIcon,
          colorClass: "bg-purple-100 text-purple-600",
          description: "Retrieved BVN details"
        },
        {
          title: "BVN Modification",
          href: "/dashboard/history/bvn/modification",
          icon: UserGroupIcon,
          colorClass: "bg-purple-100 text-purple-600",
          description: "Change of Name/DOB"
        },
        {
          title: "Android Enrollment",
          href: "/dashboard/history/bvn/enrollment",
          icon: DevicePhoneMobileIcon,
          colorClass: "bg-purple-100 text-purple-600",
          description: "New enrollment logins"
        },
        {
          title: "VNIN to NIBSS",
          href: "/dashboard/history/bvn/nibss",
          icon: GlobeAltIcon,
          colorClass: "bg-purple-100 text-purple-600",
          description: "NIBSS to NIBSS status"
        }
      ]
    },
    {
      category: "Business & Corporate",
      items: [
        {
          title: "CAC Registration",
          href: "/dashboard/history/cac",
          icon: BriefcaseIcon,
          colorClass: "bg-green-100 text-green-600",
          description: "BN & Retrieval status"
        },
        {
          title: "JTB TIN Services",
          href: "/dashboard/history/tin",
          icon: RectangleStackIcon,
          colorClass: "bg-teal-100 text-teal-600",
          description: "TIN Certs & Status"
        },
        {
          title: "Newspaper Publication",
          href: "/dashboard/history/newspaper",
          icon: NewspaperIcon,
          colorClass: "bg-gray-100 text-gray-600",
          description: "Publication proofs"
        },
        // --- NEW NPC ATTESTATION CARD ---
        {
          title: "NPC Attestation",
          href: "/dashboard/history/attestation",
          icon: ShieldCheckIcon,
          colorClass: "bg-emerald-100 text-emerald-600",
          description: "Birth Attestation Status"
        }
        // --------------------------------
      ]
    },
    {
      category: "Education & Utilities",
      items: [
        {
          title: "JAMB Services",
          href: "/dashboard/history/jamb",
          icon: AcademicCapIcon,
          colorClass: "bg-orange-100 text-orange-600",
          description: "Slips & Profile Codes"
        },
        {
          title: "Result Checker Pins",
          href: "/dashboard/history/result",
          icon: DocumentTextIcon,
          colorClass: "bg-pink-100 text-pink-600",
          description: "WAEC/NECO/NABTEB"
        },
        {
          title: "VTU (Airtime/Data)",
          href: "/dashboard/history/vtu",
          icon: PhoneIcon,
          colorClass: "bg-yellow-100 text-yellow-600",
          description: "Recharge history"
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-8 px-4 sm:px-0">
        <div className="p-3 bg-gray-900 rounded-xl shadow-lg shadow-gray-200">
          <ClockIcon className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">History Log</h1>
          <p className="text-sm text-gray-500">Track and monitor all your service transactions.</p>
        </div>
      </div>

      {/* --- Categories Grid --- */}
      <div className="space-y-12">
        {historySections.map((section) => (
          <div key={section.category} className="px-4 sm:px-0">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
              {section.category}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${item.colorClass} group-hover:scale-110 transition-transform duration-200`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
