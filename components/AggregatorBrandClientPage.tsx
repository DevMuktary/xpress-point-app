"use client";

import React from 'react';
import { 
  LinkIcon,
  GlobeAltIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import CopyButton from '@/components/CopyButton';

// Type Definitions
type EarningItem = {
  service: string;
  category: string;
  amount: number;
};

type Props = {
  subdomain: string;
  businessName: string;
  earningsData: EarningItem[]; // <--- Receiving dynamic data
};

// --- Helper: Category Badge Color ---
const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'BVN': return 'bg-blue-100 text-blue-700';
    case 'NIN': return 'bg-green-100 text-green-700';
    case 'CAC': return 'bg-orange-100 text-orange-700';
    case 'JAMB': return 'bg-purple-100 text-purple-700';
    case 'EXAM_PINS': return 'bg-indigo-100 text-indigo-700';
    case 'TIN': return 'bg-red-100 text-red-700';
    case 'NPC': return 'bg-teal-100 text-teal-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// --- The Main Component ---
export default function AggregatorBrandClientPage({ subdomain, businessName, earningsData }: Props) {
  
  const subdomainLink = `https://${subdomain}.xpresspoint.net`;
  const registerLink = `https://xpresspoint.net/register/${subdomain}`;

  return (
    <div className="space-y-8">
      {/* --- Section 1: Links --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subdomain Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <GlobeAltIcon className="h-5 w-5 text-blue-600" />
            Your Subdomain
          </h3>
          <p className="text-sm text-gray-600 mt-2 min-h-[40px]">
            Your main website link. Agents can visit this to sign up directly under your brand.
          </p>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 border border-gray-200">
              <span className="flex-1 text-sm font-medium text-blue-600 break-all">
                {subdomainLink}
              </span>
              <CopyButton textToCopy={subdomainLink} />
            </div>
          </div>
        </div>

        {/* Backup Link Card */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            Backup Referral Link
          </h3>
          <p className="text-sm text-gray-600 mt-2 min-h-[40px]">
            A direct registration link. Use this as a backup if your subdomain is unavailable.
          </p>
          
          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 border border-gray-200">
              <span className="flex-1 text-sm font-medium text-blue-600 break-all">
                {registerLink}
              </span>
              <CopyButton textToCopy={registerLink} />
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Earnings Table (Dynamic) --- */}
      <div className="rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Aggregator Earnings</h3>
              <p className="text-sm text-gray-500">Commission you earn for every successful service performed by your agents.</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Service Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {earningsData.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.service}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    ₦{item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              
              {earningsData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                    No active services found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-500">
          Earnings are automatically credited to your Commission Wallet upon successful completion of the service by your agents.
        </div>
      </div>
    </div>
  );
}
