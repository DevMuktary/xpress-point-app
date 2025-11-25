import React from 'react';
import Link from 'next/link';
import { 
  ChevronRightIcon, 
  ClockIcon, 
  CreditCardIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  NewspaperIcon,
  AcademicCapIcon,
  PhoneIcon,
  UserCircleIcon,
  LinkIcon,
  FingerPrintIcon,
  CheckBadgeIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline';

// --- Types ---
type HistoryLink = {
  title: string;
  href: string;
  icon: React.ElementType;
  colorClass: string; // Tailwind classes for icon background/text
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
          colorClass: "bg-blue-100 text-blue-600"
        }
      ]
    },
    {
      category: "Identity Services (NIMC & BVN)",
      items: [
        {
          title: "NIN Verification",
          href: "/dashboard/history/verification",
          icon: DocumentTextIcon,
          colorClass: "bg-indigo-100 text-indigo-600"
        },
        {
          title: "NIN Modification",
          href: "/dashboard/history/modification",
          icon: UserCircleIcon,
          colorClass: "bg-indigo-100 text-indigo-600"
        },
        {
          title: "NIN Validation",
          href: "/dashboard/history/validation",
          icon: CheckBadgeIcon,
          colorClass: "bg-indigo-100 text-indigo-600"
        },
        {
          title: "IPE Clearance",
          href: "/dashboard/history/ipe",
          icon: ShieldCheckIcon,
          colorClass: "bg-indigo-100 text-indigo-600"
        },
        {
          title: "Personalization",
          href: "/dashboard/history/personalization",
          icon: FingerPrintIcon,
          colorClass: "bg-indigo-100 text-indigo-600"
        },
        {
          title: "Self Service Delink",
          href: "/dashboard/history/delink",
          icon: LinkIcon,
          colorClass: "bg-indigo-100 text-indigo-600"
        },
        {
          title: "BVN Services",
          href: "/dashboard/history/bvn",
          icon: IdentificationIcon,
          colorClass: "bg-purple-100 text-purple-600"
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
          colorClass: "bg-green-100 text-green-600"
        },
        {
          title: "JTB TIN Services",
          href: "/dashboard/history/tin",
          icon: RectangleStackIcon,
          colorClass: "bg-teal-100 text-teal-600"
        },
        {
          title: "Newspaper Publication",
          href: "/dashboard/history/newspaper",
          icon: NewspaperIcon,
          colorClass: "bg-gray-100 text-gray-600"
        }
      ]
    },
    {
      category: "Education & Utilities",
      items: [
        {
          title: "JAMB Services",
          href: "/dashboard/history/jamb",
          icon: AcademicCapIcon,
          colorClass: "bg-orange-100 text-orange-600"
        },
        {
          title: "Result Checker Pins",
          href: "/dashboard/history/result",
          icon: DocumentTextIcon,
          colorClass: "bg-pink-100 text-pink-600"
        },
        {
          title: "VTU (Airtime/Data)",
          href: "/dashboard/history/vtu",
          icon: PhoneIcon,
          colorClass: "bg-yellow-100 text-yellow-600"
        }
      ]
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
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
      <div className="space-y-10">
        {historySections.map((section) => (
          <div key={section.category} className="px-4 sm:px-0">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
              {section.category}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${item.colorClass} group-hover:scale-110 transition-transform duration-200`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">View Records</p>
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
