"use client"; // This is an interactive component

import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

// Define the props this component will accept
type AccountCardProps = {
  bankName: string;
  accountName: string;
  accountNumber: string;
};

export default function AccountCard({ bankName, accountName, accountNumber }: AccountCardProps) {
  // State to manage the "Copied!" message
  const [copied, setCopied] = useState(false);

  // This is the "world-class" copy-to-clipboard function
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); // Show "Copied!"
      
      // Reset the button back to "Copy" after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900">{bankName}</span>
        {/* The "Copy" Button */}
        <button
          onClick={() => handleCopy(accountNumber)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all
            ${copied 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <ClipboardIcon className="h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="mt-4 text-3xl font-bold text-blue-600 tracking-wider">
        {accountNumber}
      </p>
      
      <p className="mt-2 text-sm text-gray-600">
        Account Name: <span className="font-medium text-gray-800">{accountName}</span>
      </p>
    </div>
  );
}
