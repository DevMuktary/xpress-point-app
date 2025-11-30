"use client";

import React, { useState } from 'react';
import { 
  CheckCircleIcon, ClockIcon, XCircleIcon, 
  ArrowPathIcon, DocumentArrowDownIcon, 
  MagnifyingGlassIcon, UserIcon, MapPinIcon
} from '@heroicons/react/24/outline';

// --- Helper to display status ---
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'COMPLETED':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircleIcon className="w-3 h-3" /> Completed</span>;
    case 'FAILED':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircleIcon className="w-3 h-3" /> Failed</span>;
    case 'PROCESSING':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><ArrowPathIcon className="w-3 h-3 animate-spin" /> Processing</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><ClockIcon className="w-3 h-3" /> Pending</span>;
  }
};

export default function NpcHistoryClientPage({ initialRequests }: { initialRequests: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = initialRequests.filter(req => {
    const d = req.formData;
    const searchStr = `${d.surname} ${d.firstName} ${d.phone}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input 
          type="text" placeholder="Search by Name or Phone..." 
          className="pl-10 w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:ring-green-500 focus:border-green-500"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
           <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
             No requests found.
           </div>
        )}

        {filtered.map((req) => {
          const d = req.formData;
          return (
            <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{d.surname} {d.firstName} {d.middleName}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                     <UserIcon className="h-3 w-3"/> {d.phone} • {d.email}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">
                 <div>
                    <span className="block text-xs text-gray-400 uppercase">Origin</span>
                    <span className="font-medium">{d.lgaOrigin}, {d.stateOrigin}</span>
                 </div>
                 <div>
                    <span className="block text-xs text-gray-400 uppercase">Submission Date</span>
                    <span className="font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                 {req.certificateUrl ? (
                    <a 
                      href={req.certificateUrl} target="_blank" 
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" /> Download Certificate
                    </a>
                 ) : (
                    <button disabled className="flex-1 py-2 bg-gray-100 text-gray-400 rounded-lg text-sm font-bold cursor-not-allowed">
                      Certificate Not Ready
                    </button>
                 )}
                 
                 {req.statusMessage && (
                   <p className="text-xs text-gray-500 italic flex-1 text-right">{req.statusMessage}</p>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
