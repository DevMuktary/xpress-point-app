"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

type RequestItem = {
  id: string;
  serviceName: string;
  status: string;
  statusMessage: string | null;
  formData: any;
  createdAt: string;
  uploadedSlipUrl: string | null;
};

export default function ModificationHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => 
    req.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.statusMessage && req.statusMessage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' };
      case 'PROCESSING': return { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon, text: 'Processing' };
      case 'FAILED': return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Failed' };
      default: return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
           <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
           <p className="mt-2 font-semibold">No Records Found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const statusInfo = getStatusInfo(req.status);
            
            // --- THE FIX ---
            // We look inside formData for 'resultUrl'. 
            // We DO NOT use 'uploadedSlipUrl' (that's the user's passport).
            const resultUrl = (req.formData as any)?.resultUrl; 

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.serviceName}</h3>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <statusInfo.icon className={`h-3 w-3 ${req.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4">
                    {req.statusMessage}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  
                  {/* 1. Download Result (Only if Completed & Admin uploaded it) */}
                  {req.status === 'COMPLETED' && resultUrl ? (
                    <a 
                      href={resultUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      Download Result
                    </a>
                  ) : null}

                  {/* 2. View My Upload (Passport) - Optional helpful link for user */}
                  {req.uploadedSlipUrl && (
                    <a 
                      href={req.uploadedSlipUrl} 
                      target="_blank" 
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      View My Passport
                    </a>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
