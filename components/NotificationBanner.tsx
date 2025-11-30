"use client";

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function NotificationBanner({ content }: { content: string }) {
  const [isVisible, setIsVisible] = useState(true);

  // Optional: Prevent scrolling when the modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!isVisible || !content) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Close Button (Top Right) */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Admin Content */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <div 
            className="prose prose-sm sm:prose-base max-w-none text-gray-700"
            // This renders the HTML/CSS exactly as the Admin typed it
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </div>

        {/* Footer Button (Optional 'Close' text for better UX) */}
        <div className="bg-gray-50 p-4 flex justify-center border-t border-gray-100">
          <button
            onClick={() => setIsVisible(false)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
          >
            Close Announcement
          </button>
        </div>
      </div>
    </div>
  );
}
