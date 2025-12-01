"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  DocumentArrowUpIcon,
  UserIcon,
  ShieldCheckIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type AdminRequest = {
  id: string;
  nin: string;
  scode: string;
  status: string;
  statusMessage: string | null;
  createdAt: string | Date;
  adminNote: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminValidationRequestsClientPage({ initialRequests }: { initialRequests: any[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState<AdminRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal & Processing States
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null);
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [adminFile, setAdminFile] = useState<File | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  // --- Filter Logic ---
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.nin}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Actions ---
  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setAdminFile(null);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const uploadProof = async (): Promise<string | null> => {
    if (!adminFile) return null;
    const formData = new FormData();
    formData.append('attestation', adminFile); 
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    } catch (e) {
      alert("File upload failed");
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedReq || !actionType) return;
    setIsProcessing(true);

    let fileUrl = null;
    if (actionType === 'COMPLETED' && adminFile) {
      setIsUploading(true);
      fileUrl = await uploadProof();
      setIsUploading(false);
      if (!fileUrl) {
        setIsProcessing(false);
        return; 
      }
    }

    try {
      const res = await fetch('/api/admin/nin/validation/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          adminFileUrl: fileUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: actionType } : r));
      closeModal();
      router.refresh();

    } catch (error) {
      alert("Error processing request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getTypeLabel = (scode: string) => {
    if (scode === 'NO_RECORD') return 'No Record';
    if (scode === 'UPDATE_RECORD') return 'Record Update';
    return scode;
  };

  // --- Render Full Details ---
  const renderFullDetails = (req: AdminRequest) => (
    <div className="space-y-6 text-sm text-gray-700">
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start justify-between">
          <div>
            <h4 className="text-xs font-bold text-indigo-800 uppercase mb-1">Validation Type</h4>
            <p className="text-lg font-bold text-indigo-900">{getTypeLabel(req.scode)}</p>
          </div>
          <div className="text-right">
            <h4 className="text-xs font-bold text-indigo-800 uppercase mb-1">NIN Number</h4>
            <p className="text-lg font-mono font-bold text-gray-900 tracking-wider">{req.nin}</p>
          </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
          <UserIcon className="h-4 w-4" /> Agent Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div><span className="block text-xs text-gray-400">Name</span><span className="font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</span></div>
          <div><span className="block text-xs text-gray-400">Phone</span><span className="font-medium text-gray-900">{req.user.phoneNumber}</span></div>
          <div className="col-span-2"><span className="block text-xs text-gray-400">Email</span><span className="font-medium text-gray-900">{req.user.email}</span></div>
        </div>
      </div>

      <div className="border p-4 rounded-lg">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4"/> Request Status
        </h4>
        <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>{req.status}</span>
            <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString()}</span>
        </div>
        {req.statusMessage && <div className="mt-3 p-3 bg-gray-50 rounded text-xs italic text-gray-600 border border-gray-100">&quot;{req.statusMessage}&quot;</div>}
      </div>
    </div>
  );

  return (
    <div>
      {/* --- MAIN CONTAINER: Controls & Table in One Card --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 1. Header & Controls Area */}
        <div className="p-5 border-b border-gray-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full md:max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search NIN, Agent Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <FunnelIcon className="w-5 h-5 text-gray-400 hidden md:block" />
            {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors whitespace-nowrap border
                  ${filterStatus === status 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* 2. The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Agent Info</th>
                <th className="px-6 py-4 font-bold">Service Type</th>
                <th className="px-6 py-4 font-bold">NIN Number</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                    <div className="text-xs text-gray-400">{req.user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                      {getTypeLabel(req.scode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-900 font-bold">
                    {req.nin}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                        {req.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       {/* View Details */}
                       <button 
                         onClick={() => setViewReq(req)}
                         className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                         title="View Details"
                       >
                         <EyeIcon className="w-5 h-5" />
                       </button>
                       
                       {/* Actions */}
                       {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                         <>
                           <button onClick={() => openActionModal(req, 'PROCESSING')} className="text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">Process</button>
                           <button onClick={() => openActionModal(req, 'COMPLETED')} className="text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors">Approve</button>
                           <button onClick={() => openActionModal(req, 'FAILED')} className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors">Reject</button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 bg-white">
                    <div className="flex flex-col items-center justify-center">
                      <MagnifyingGlassIcon className="w-12 h-12 mb-2 opacity-20" />
                      <p>No requests found matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {viewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-gray-50">
               <h3 className="text-lg font-bold text-gray-900">Request Details</h3>
               <button onClick={() => setViewReq(null)} className="text-gray-400 hover:text-gray-600">
                 <XMarkIcon className="h-6 w-6"/>
               </button>
             </div>
             <div className="p-6 max-h-[70vh] overflow-y-auto">
               {renderFullDetails(viewReq)}
             </div>
          </div>
        </div>
      )}

      {/* --- ACTION MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {actionType === 'PROCESSING' && 'Mark as Processing'}
                  {actionType === 'COMPLETED' && 'Approve Validation'}
                  {actionType === 'FAILED' && 'Reject Validation'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">NIN: <span className="font-mono font-medium">{selectedReq.nin}</span></p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6"/>
              </button>
            </div>

            <div className="space-y-5">
              
              {/* File Upload (Completed) */}
              {actionType === 'COMPLETED' && (
                <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                    <DocumentArrowUpIcon className="h-4 w-4"/> Upload Result (Optional)
                  </label>
                  <input 
                    type="file" 
                    onChange={e => setAdminFile(e.target.files?.[0] || null)} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              )}

              {/* Refund (Failed) */}
              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 bg-red-100 rounded-full text-red-600"><ArrowPathIcon className="h-4 w-4"/></div>
                       <span className="text-sm font-bold text-red-900">Refund Agent?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                 </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note / Response</label>
                <textarea 
                  placeholder={actionType === 'COMPLETED' ? "e.g., Validation successful." : "e.g., Invalid NIN."}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[100px]" 
                  value={adminNote} 
                  onChange={e => setAdminNote(e.target.value)} 
                />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={closeModal} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isProcessing || isUploading} 
                  className={`flex-1 py-3 font-bold rounded-xl text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2
                    ${actionType === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : actionType === 'FAILED' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isProcessing || isUploading ? (
                      <><ArrowPathIcon className="h-5 w-5 animate-spin"/> Processing...</>
                    ) : (
                      'Confirm Action'
                    )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
