"use client"; // This is an interactive component

import React, { useState } from 'react';
import { 
  ClipboardIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

type Props = {
  textToCopy: string;
};

// This is the "stunning" and "stable" Copy Button
export default function CopyButton({ textToCopy }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      // "Refurbish" to reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all
        ${copied 
          ? 'bg-green-100 text-green-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
    >
      {copied ? (
        <ClipboardDocumentCheckIcon className="h-4 w-4" />
      ) : (
        <ClipboardIcon className="h-4 w-4" />
      )}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
