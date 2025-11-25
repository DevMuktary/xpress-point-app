"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  DocumentMagnifyingGlassIcon,
  ClipboardDocumentIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

type RequestItem = {
  id: string;
  serviceName: string;
  status: string;
  statusMessage: string | null;
  retrievalResult: string | null;
  formData: any;
  createdAt: string;
};

export default function BvnRetrievalHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filtering Logic ---
  const filteredRequests = requests.filter(req => {
    const d = req.formData || {};
    const searchStr = `${req.serviceName} ${d.fullName || ''} ${d.phone || ''} ${d.ticketId || ''} ${req.retrievalResult || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("BVN Copied to clipboard!");
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
      
      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by Name, Phone, or BVN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
           <p className="mt-2 font-semibold text-gray-900">No Retrieval History Found</p>
           <p className="text-sm">You haven't submitted any retrieval requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const statusInfo = getStatusInfo(req.status);
            const d = req.formData || {};
            const adminFileUrl = d.adminResultUrl; // If admin uploaded a file

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header: Service Name & Status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.serviceName}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}>
                    <statusInfo.icon className={`h-3.5 w-3.5 ${req.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>

                {/* Details Section */}
                <div className="text-sm text-gray-700 space-y-1 mb-3">
                  {d.phone && <p><span className="text-gray-500">Phone:</span> <span className="font-medium">{d.phone}</span></p>}
                  {d.fullName && <p><span className="text-gray-500">Name:</span> <span className="font-medium">{d.fullName}</span></p>}
                  {d.agentCode && <p><span className="text-gray-500">Agent Code:</span> <span className="font-medium">{d.agentCode}</span></p>}
                  {d.ticketId && <p><span className="text-gray-500">Ticket ID:</span> <span className="font-medium">{d.ticketId}</span></p>}
                </div>

                {/* --- THE RESULT SECTION --- */}
                {req.status === 'COMPLETED' && req.retrievalResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Retrieved BVN</p>
                      <p className="text-2xl font-mono font-bold text-green-900 tracking-wider mt-1">{req.retrievalResult}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(req.retrievalResult!)} 
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                      title="Copy BVN"
                    >
                      <ClipboardDocumentIcon className="h-6 w-6" />
                    </button>
                  </div>
                )}

                {/* Admin Message / Feedback */}
                {req.statusMessage && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-xs text-gray-400 uppercase block mb-1">Admin Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Download File Button (Optional) */}
                {req.status === 'COMPLETED' && adminFileUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a href={adminFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                      <DocumentArrowDownIcon className="h-4 w-4" /> Download Result Slip
                    </a>
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
