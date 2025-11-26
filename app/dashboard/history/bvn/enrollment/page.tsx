"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  MagnifyingGlassIcon, 
  DocumentMagnifyingGlassIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

type RequestItem = {
  id: string;
  serviceName: string;
  status: string;
  statusMessage: string | null;
  formData: any;
  createdAt: string;
};

export default function BvnEnrollmentHistoryClientPage({ initialRequests }: { initialRequests: RequestItem[] }) {
  const [requests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = requests.filter(req => {
    const d = req.formData || {};
    const searchStr = `${req.serviceName} ${d.firstName || ''} ${d.lastName || ''} ${d.phone || ''}`.toLowerCase();
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
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text" placeholder="Search history..." value={searchTerm}
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

                <div className="text-sm text-gray-700 space-y-1 mb-3 bg-gray-50 p-3 rounded-lg">
                  <p><strong>Agent Name:</strong> {d.firstName} {d.lastName}</p>
                  <p><strong>Agent BVN:</strong> {d.agentBvn}</p>
                  <p><strong>Phone:</strong> {d.phone}</p>
                </div>

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100 mb-3">
                    <span className="font-bold text-xs text-blue-500 uppercase block">Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Completion Instructions */}
                {req.status === 'COMPLETED' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                     <div className="flex items-start gap-2">
                        <InformationCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <div className="text-sm text-green-800">
                          <p className="font-bold mb-1">Setup Successful</p>
                          <p className="mb-2">You will receive your User Login Details via Email from NIBSS.</p>
                          <p>
                            To check the status of your enrolments, use your Agent Code at: <br/>
                            <a href="https://agency.xpresspoint.net" target="_blank" className="underline font-bold text-green-900">agency.xpresspoint.net</a>
                          </p>
                        </div>
                     </div>
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
