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
  FunnelIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon
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
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getTypeLabel = (scode: string) => {
    if (scode === 'NO_RECORD') return 'No Record';
    if (scode === 'UPDATE_RECORD') return 'Record Update';
    return scode;
  };

  // --- Render View Details Modal Content ---
  const renderFullDetails = (req: AdminRequest) => (
    <div className="space-y-6 text-sm text-gray-700">
      
      {/* Header Info */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
         <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Request Type</p>
            <p className="text-lg font-bold text-blue-900">{getTypeLabel(req.scode)}</p>
         </div>
         <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase">NIN Number</p>
            <p className="text-xl font-mono font-black text-gray-800 tracking-widest">{req.nin}</p>
         </div>
      </div>

      {/* Agent Info */}
      <div className="space-y-3">
         <h4 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">Agent Information</h4>
         <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
               <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
               <div>
                 <span className="block text-xs text-gray-500">Name</span>
                 <span className="font-medium text-gray-900">{req.user.firstName} {req.user.lastName}</span>
               </div>
            </div>
            <div className="flex items-start gap-2">
               <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
               <div>
                 <span className="block text-xs text-gray-500">Phone</span>
                 <span className="font-medium text-gray-900">{req.user.phoneNumber}</span>
               </div>
            </div>
            <div className="col-span-2 flex items-start gap-2">
               <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
               <div>
                 <span className="block text-xs text-gray-500">Email</span>
                 <span className="font-medium text-gray-900">{req.user.email}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Request Metadata */}
      <div className="space-y-3">
         <h4 className="text-xs font-bold text-gray-400 uppercase border-b pb-1">System Metadata</h4>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
               <div>
                 <span className="block text-xs text-gray-500">Submitted</span>
                 <span className="font-medium text-gray-900">{new Date(req.createdAt).toLocaleString()}</span>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
               <div>
                 <span className="block text-xs text-gray-500">Request ID</span>
                 <span className="font-mono text-xs text-gray-900 bg-gray-100 px-1 rounded">{req.id.slice(0,8)}...</span>
               </div>
            </div>
         </div>
         <div className="pt-2">
           <span className="block text-xs text-gray-500 mb-1">Current Status</span>
           <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(req.status)}`}>
              {req.status}
           </span>
         </div>
         {req.statusMessage && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-md text-xs italic">
               Note: {req.statusMessage}
            </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* --- 1. Search & Filter Header --- */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
        
        {/* Search Input */}
        <div className="w-full md:w-96">
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Find Request</label>
          <div className="relative">
             <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search by NIN, Name or Phone..." 
               className="pl-10 w-full rounded-xl border-gray-300 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm"
               value={searchTerm} 
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Status Filters */}
        <div className="w-full md:w-auto">
           <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Filter Status</label>
           <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
             {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
               <button 
                 key={s} 
                 onClick={() => setFilterStatus(s)} 
                 className={`px-4 py-2 text-xs font-bold rounded-lg transition-all
                   ${filterStatus === s 
                     ? 'bg-gray-900 text-white shadow-md' 
                     : 'text-gray-500 hover:bg-gray-50'}`}
               >
                 {s}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* --- 2. The Data Table --- */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Agent</th>
                <th className="px-6 py-4 font-bold">Type</th>
                <th className="px-6 py-4 font-bold">NIN</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="bg-white hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {new Date(req.createdAt).toLocaleDateString()}
                    <span className="block text-xs text-gray-400 font-normal">
                      {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                    <div className="text-xs text-gray-400">{req.user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 whitespace-nowrap">
                      {getTypeLabel(req.scode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-800 font-bold tracking-wide">
                    {req.nin}
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(req.status)}`}>
                        {req.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                       {/* View */}
                       <button 
                         onClick={() => setViewReq(req)}
                         className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                         title="View Details"
                       >
                         <EyeIcon className="w-5 h-5" />
                       </button>
                       
                       {/* Actions - Only show if not in final state */}
                       {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                         <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                           <button onClick={() => openActionModal(req, 'PROCESSING')} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-blue-600" title="Mark Processing"><ArrowPathIcon className="h-4 w-4"/></button>
                           <button onClick={() => openActionModal(req, 'COMPLETED')} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-green-600" title="Approve"><CheckCircleIcon className="h-4 w-4"/></button>
                           <button onClick={() => openActionModal(req, 'FAILED')} className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-red-600" title="Reject"><XMarkIcon className="h-4 w-4"/></button>
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 bg-white">
                    <div className="flex flex-col items-center justify-center">
                      <MagnifyingGlassIcon className="w-16 h-16 mb-4 opacity-10" />
                      <p className="text-lg font-medium text-gray-500">No requests found</p>
                      <p className="text-sm">Try adjusting your search or filters.</p>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center border-b border-gray-100 p-5 bg-gray-50">
               <h3 className="text-lg font-bold text-gray-900">Request Details</h3>
               <button onClick={() => setViewReq(null)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                 <XMarkIcon className="h-5 w-5 text-gray-500"/>
               </button>
             </div>
             <div className="p-6 overflow-y-auto">
               {renderFullDetails(viewReq)}
             </div>
             <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
               <button onClick={() => setViewReq(null)} className="px-6 py-2 bg-white border border-gray-300 font-bold text-gray-700 rounded-lg hover:bg-gray-100 shadow-sm text-sm">Close</button>
             </div>
          </div>
        </div>
      )}

      {/* --- PROCESS ACTION MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            
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
                <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-100">
                  <label className="block text-xs font-bold text-green-800 uppercase flex items-center gap-2">
                    <DocumentArrowUpIcon className="h-4 w-4"/> Upload Result (Optional)
                  </label>
                  <input 
                    type="file" 
                    onChange={e => setAdminFile(e.target.files?.[0] || null)} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-green-700 hover:file:bg-green-50 cursor-pointer"
                  />
                  <p className="text-[10px] text-green-600 italic">Upload screenshot or PDF if available.</p>
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

              {/* Admin Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note / Response</label>
                <textarea 
                  placeholder={actionType === 'COMPLETED' ? "e.g., Validation successful. Data updated." : "e.g., Invalid NIN provided."}
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
                      <><ArrowPathIcon className="h-5 w-5 animate-spin"/> Saving...</>
                    ) : (
                      'Confirm'
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
