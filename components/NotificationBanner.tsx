"use client";

import React, { useState } from 'react';
import { XMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

export default function NotificationBanner({ content }: { content: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !content) return null;

  return (
    <div className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-1 shadow-lg animate-in fade-in slide-in-from-top-4">
      <div className="relative rounded-lg bg-white p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <SpeakerWaveIcon className="h-6 w-6" />
            </span>
          </div>
          
          <div className="flex-1 pt-1">
            {/* Render Admin HTML Content Safely */}
            <div 
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </div>

          <button 
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
