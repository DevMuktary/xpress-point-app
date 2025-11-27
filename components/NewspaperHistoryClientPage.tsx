"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  DocumentMagnifyingGlassIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

type RequestItem = {
  id: string;
  serviceName: string;
  status: string;
  statusMessage: string | null;
  formData: any;
  publicationUrl: string | null;
  pageNumber: string | null;
  createdAt: string;
};

export default function NewspaperHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => {
    const d = req.formData || {};
    const searchStr = `${req.serviceName} ${d.oldFirstName || ''} ${d.newFirstName || ''} ${d.oldLastName || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

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
          type="text" placeholder="Search by Name..." value={searchTerm}
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

                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Old Name</p>
                    <p>{d.oldFirstName} {d.oldLastName} {d.oldMiddleName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">New Name</p>
                    <p className="font-medium text-blue-900">{d.newFirstName} {d.newLastName} {d.newMiddleName}</p>
                  </div>
                </div>

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="font-bold text-xs text-blue-500 uppercase block">Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Download Button */}
                {req.status === 'COMPLETED' && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-4">
                    {req.publicationUrl && (
                      <a href={req.publicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors">
                        <DocumentArrowDownIcon className="h-4 w-4" /> Download Publication
                      </a>
                    )}
                    {req.pageNumber && (
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded border border-gray-200">
                        Page No: {req.pageNumber}
                      </span>
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
