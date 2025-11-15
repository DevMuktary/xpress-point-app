"use client"; // This is an interactive component

import React from 'react';
import { 
  LinkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import CopyButton from '@/components/CopyButton'; // <-- "World-Class" Import

// Define the props to receive the initial data from the server
type Props = {
  subdomain: string;
  businessName: string;
};

// --- The Main "World-Class" Component ---
export default function AggregatorBrandClientPage({ subdomain, businessName }: Props) {
  
  // "Stunningly" create the two links
  const subdomainLink = `https://${subdomain}.xpresspoint.net`;
  const registerLink = `https://xpresspoint.net/register/${subdomain}`;

  return (
    <div className="space-y-6">
      {/* --- 1. The "Stunning" Subdomain Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">
          Your "World-Class" Subdomain
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          This is your "stunning" and "instant" subdomain. When agents visit this link, they will be taken to your referral sign-up page.
        </p>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Your Subdomain Link
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 border border-gray-200">
            <GlobeAltIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-blue-600 break-all">
              {subdomainLink}
            </span>
            <CopyButton textToCopy={subdomainLink} />
          </div>
        </div>
      </div>

      {/* --- 2. The "Stable" Fallback Link Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">
          Your "Stable" Referral Link
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          If the subdomain is ever "rubbish" or "unstable" (e.g., DNS issues), this link is a "world-class" backup that *always* works.
        </p>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Your Referral Link
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 border border-gray-200">
            <LinkIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-blue-600 break-all">
              {registerLink}
            </span>
            <CopyButton textToCopy={registerLink} />
          </div>
        </div>
      </div>
    </div>
  );
}
