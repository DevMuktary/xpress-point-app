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
  phone: string | null;
  name: string | null;
};

export default function BvnHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => 
    req.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.phone && req.phone.includes(searchTerm)) ||
    (req.name && req.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("BVN Copied!");
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
          type="text" placeholder="Search by Service, Name, or Phone..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10"
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
            const adminFileUrl = (req.formData as any)?.adminResultUrl;

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{req.serviceName}</h3>
                    <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</p>
                    {req.name && <p className="text-xs text-gray-600 mt-1">Name: {req.name}</p>}
                    {req.phone && <p className="text-xs text-gray-600">Phone: {req.phone}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <statusInfo.icon className={`h-3 w-3 ${req.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>

                {/* Retrieval Result Section */}
                {req.status === 'COMPLETED' && req.retrievalResult && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-bold uppercase">Retrieved BVN</p>
                      <p className="text-lg font-mono font-bold text-green-900 tracking-wider">{req.retrievalResult}</p>
                    </div>
                    <button onClick={() => copyToClipboard(req.retrievalResult!)} className="text-green-600 hover:text-green-800">
                      <ClipboardDocumentIcon className="h-6 w-6" />
                    </button>
                  </div>
                )}

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-bold text-xs text-gray-400 uppercase block">Admin Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Download File Button */}
                {req.status === 'COMPLETED' && adminFileUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a href={adminFileUrl} target="_blank" className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
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
