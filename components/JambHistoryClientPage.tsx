"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  DocumentMagnifyingGlassIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

type RequestItem = {
  id: string;
  serviceName: string;
  status: string;
  statusMessage: string | null;
  formData: any;
  uploadedSlipUrl: string | null;
  profileCodeResult: string | null;
  createdAt: string;
};

export default function JambHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => {
    const d = req.formData || {};
    const searchStr = `${req.serviceName} ${d.fullName || ''} ${d.regNumber || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

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
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text" placeholder="Search by Reg Number or Name..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-orange-500 focus:ring-orange-500"
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
            const d = req.formData || {};

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.serviceName}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <statusInfo.icon className={`h-3 w-3 ${req.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>

                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">
                  <p><strong>Name:</strong> {d.fullName}</p>
                  <p><strong>Reg No:</strong> {d.regNumber}</p>
                </div>

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="font-bold text-xs text-blue-500 uppercase block">Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Results Display */}
                {req.status === 'COMPLETED' && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {/* If Profile Code Result (Text) */}
                    {req.profileCodeResult && (
                       <div className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-100">
                         <div>
                           <span className="text-xs font-bold text-green-600 uppercase">Profile Code</span>
                           <p className="text-lg font-mono font-bold text-green-900">{req.profileCodeResult}</p>
                         </div>
                         <button onClick={() => copyToClipboard(req.profileCodeResult!)} className="text-green-600 hover:text-green-800">
                           <ClipboardDocumentIcon className="h-5 w-5"/>
                         </button>
                       </div>
                    )}
                    
                    {/* If Slip Result (PDF) */}
                    {req.uploadedSlipUrl && (
                      <a href={req.uploadedSlipUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors w-fit">
                        <DocumentArrowDownIcon className="h-4 w-4" /> Download Slip
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
