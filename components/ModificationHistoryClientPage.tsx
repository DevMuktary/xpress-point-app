"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon, 
  ClockIcon, 
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  MapPinIcon
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
    (req.formData?.nin && req.formData.nin.includes(searchTerm)) ||
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

  // --- Helper to render specific details based on modification type ---
  const renderSummary = (req: RequestItem) => {
    const d = req.formData || {};
    const type = req.serviceName.toUpperCase();

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
        <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-2">
          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-xs">
            NIN: {d.nin}
          </span>
        </div>

        {/* Name Change Details */}
        {type.includes('NAME') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-gray-500">Old Name</span>
              <span className="font-medium text-gray-900">{d.oldName || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">New Name</span>
              <span className="font-medium text-gray-900">
                {d.newFirstName || d.firstName} {d.newLastName || d.lastName}
              </span>
            </div>
          </div>
        )}

        {/* DOB Change Details */}
        {type.includes('BIRTH') || type.includes('DOB') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-gray-500">Old DOB</span>
              <span className="font-medium text-gray-900">{d.oldDob || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">New DOB</span>
              <span className="font-medium text-blue-700">{d.newDob}</span>
            </div>
          </div>
        )}

        {/* Phone Change Details */}
        {type.includes('PHONE') && (
          <div className="grid grid-cols-2 gap-4">
             <div>
              <span className="block text-xs text-gray-500">Old Phone</span>
              <span className="font-medium text-gray-900">{d.oldPhone || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500">New Phone</span>
              <span className="font-medium text-gray-900">{d.newPhone}</span>
            </div>
          </div>
        )}

        {/* Address Change Details */}
        {type.includes('ADDRESS') && (
          <div>
             <span className="block text-xs text-gray-500">New Address</span>
             <span className="font-medium text-gray-900">
               {d.newAddress || d.address}, {d.lga}, {d.state}
             </span>
          </div>
        )}
      </div>
    );
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
          placeholder="Search by NIN, Name, or Status..."
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
            const resultUrl = (req.formData as any)?.resultUrl; 

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{req.serviceName}</h3>
                    <p className="text-xs text-gray-500 mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}>
                    <statusInfo.icon className={`h-3.5 w-3.5 ${req.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
                    {statusInfo.text}
                  </span>
                </div>

                {/* Details Summary Block */}
                {renderSummary(req)}

                {/* Admin Message */}
                {req.statusMessage && (
                  <div className="mt-3 bg-blue-50 p-3 rounded-lg text-sm text-blue-800 border border-blue-100">
                    <span className="font-bold text-xs uppercase text-blue-400 block mb-1">Admin Update</span>
                    {req.statusMessage}
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-gray-100">
                  
                  {/* 1. Download Result */}
                  {req.status === 'COMPLETED' && resultUrl ? (
                    <a 
                      href={resultUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      Download Result
                    </a>
                  ) : null}

                  {/* 2. View My Upload (Passport) */}
                  {req.uploadedSlipUrl && (
                    <a 
                      href={req.uploadedSlipUrl} 
                      target="_blank" 
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                    >
                      <UserIcon className="h-4 w-4" /> View My Upload
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
