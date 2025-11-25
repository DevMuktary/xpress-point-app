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
  createdAt: string;
};

export default function BvnModificationHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => 
    req.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (req.formData?.nin && req.formData.nin.includes(searchTerm)) ||
    (req.formData?.bvn && req.formData.bvn.includes(searchTerm))
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
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text" placeholder="Search by Service, NIN, or BVN..." value={searchTerm}
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
            const d = req.formData || {};
            const adminFileUrl = d.adminResultUrl;

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
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

                {/* Details Summary */}
                <div className="text-sm text-gray-700 space-y-1 mb-3 bg-gray-50 p-3 rounded-lg">
                  <p><strong>BVN:</strong> {d.bvn} | <strong>NIN:</strong> {d.nin}</p>
                  {d.newFirstName && <p>Name Change: {d.newFirstName} {d.newLastName}</p>}
                  {d.newDob && <p>DOB Change: {d.newDob}</p>}
                  {d.newPhone && <p>Phone Change: {d.newPhone}</p>}
                </div>

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="font-bold text-xs text-blue-500 uppercase block">Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Download File Button */}
                {req.status === 'COMPLETED' && adminFileUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a href={adminFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-green-700 hover:underline">
                      <DocumentArrowDownIcon className="h-4 w-4" /> Download Result
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
