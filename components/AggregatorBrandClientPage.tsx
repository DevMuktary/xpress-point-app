"use client"; // This is an interactive component

import React, { useState } from 'react';
import { 
  LinkIcon,
  GlobeAltIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import CopyButton from '@/components/CopyButton'; // Import the CopyButton

// Type Definitions
type Props = {
  subdomain: string;
  businessName: string;
};

// --- The Main Component ---
export default function AggregatorBrandClientPage({ subdomain, businessName }: Props) {
  
  // Create the two links
  const subdomainLink = `https://${subdomain}.xpresspoint.net`;
  const registerLink = `https://xpresspoint.net/register/${subdomain}`;

  return (
    <div className="space-y-6">
      {/* --- 1. Your Subdomain Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">
          Your Subdomain
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          This is your main subdomain. When agents visit this link, they will be taken to your referral sign-up page.
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

      {/* --- 2. Your Backup Link Card --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">
          Your Backup Referral Link
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          If the subdomain is ever unavailable or having  issues, this link is a reliable backup that always works.
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
