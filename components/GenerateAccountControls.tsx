"use client";

import React from 'react';
import { ClipboardDocumentIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type Props = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export default function AccountCard({ bankName, accountNumber, accountName }: Props) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine styling based on bank
  const isPalmPay = bankName.toLowerCase().includes('palm');
  const bgColor = isPalmPay ? 'bg-[#673AB7]' : 'bg-green-700'; // Purple for PalmPay, Green for others
  const bgGradient = isPalmPay 
    ? 'bg-gradient-to-br from-[#673AB7] to-[#512DA8]' 
    : 'bg-gradient-to-br from-green-600 to-green-800';

  return (
    <div className={`relative overflow-hidden rounded-2xl ${bgGradient} p-6 text-white shadow-xl transition-transform hover:scale-[1.01]`}>
      
      {/* Background Decoration */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>

      <div className="relative z-10">
        {/* Header: Bank Logo & Name */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <BuildingLibraryIcon className="h-4 w-4 text-white/90" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">{bankName}</span>
          </div>
          {/* Chip Icon (Decoration) */}
          <div className="h-8 w-10 rounded bg-gradient-to-tr from-yellow-200 to-yellow-500 opacity-80"></div>
        </div>

        {/* Account Number Section */}
        <div className="text-center mb-6">
          <p className="text-xs text-white/60 uppercase tracking-widest mb-1">Account Number</p>
          <div className="flex items-center justify-center gap-3" onClick={handleCopy}>
            <h2 className="text-4xl font-mono font-bold tracking-widest cursor-pointer select-all">
              {accountNumber}
            </h2>
            <button 
              className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
              title="Copy Number"
            >
              {copied ? (
                <CheckCircleIcon className="h-5 w-5 text-green-300" />
              ) : (
                <ClipboardDocumentIcon className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
          {copied && <p className="text-xs text-green-300 mt-1 font-bold animate-pulse">Copied to clipboard!</p>}
        </div>

        {/* Footer: Account Name */}
        <div className="flex justify-between items-end border-t border-white/10 pt-4">
          <div>
            <p className="text-[10px] text-white/60 uppercase">Account Name</p>
            <p className="font-medium text-lg tracking-wide truncate max-w-[250px]">{accountName}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-white/60 uppercase">Status</p>
             <div className="flex items-center gap-1">
               <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-sm font-bold text-green-300">Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
