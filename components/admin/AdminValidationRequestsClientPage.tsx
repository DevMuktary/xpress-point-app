"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  UserIcon, 
  EyeIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type AdminRequest = {
  id: string;
  nin: string;
  scode: string;
  status: string;
  statusMessage: string | null;
  createdAt: string;
  formData: any;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminValidationRequestsClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal State
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null);
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  
  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [adminFile, setAdminFile] = useState<File | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  // --- Filter Logic ---
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.nin}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
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
    }

    try {
      const res = await fetch('/api/admin/requests/process/nin-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          resultUrl: fileUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      // Update Local State
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
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeLabel = (scode: string) => {
    // Map scode number/string to readable text if possible, otherwise return scode
    const map: Record<string, string> = {
      '47': 'No Record Found',
      '48': 'Sim Card Issues',
      '49': 'Bank Validation',
      '50': 'Photographer Error'
    };
    return map[scode] || `Validation Type ${scode}`;
  };

  const renderFullDetails = (req: AdminRequest) => (
    <div className="space-y-5 text-sm text-gray-700">
      <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex justify-between items-center">
         <div>
           <h4 className="text-xs font-bold text-green-800 uppercase mb-1">Validation Reason</h4>
           <p className="text-lg font-bold text-green-900">{getTypeLabel(req.scode)}</p>
         </div>
         <IdentificationIcon className="h-10 w-10 text-green-200" />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Agent Info</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-xs text-gray-400">Name</span>
            <span className="font-semibold text-gray-900">{req.user.firstName} {req.user.lastName}</span>
          </div>
          <div>
            <span className="block text-xs text-gray-400">Phone</span>
            <span className="font-medium text-gray-900">{req.user.phoneNumber}</span>
          </div>
          <div className="col-span-2">
            <span className="block text-xs text-gray-400">Email</span>
            <span className="font-medium text-gray-900">{req.user.email}</span>
          </div>
        </div>
      </div>

      <div className="p-3 border rounded-lg">
         <div className="flex justify-between">
            <span className="text-gray-500">NIN Number:</span>
            <span className="font-mono font-bold text-xl text-gray-900">{req.nin}</span>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" placeholder="Search NIN, Agent Name..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm focus:ring-green-500"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filterStatus === s ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">NIN</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      {getTypeLabel(req.scode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-gray-800">
                    {req.nin}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                     <div className="flex justify-end items-center gap-2">
                       <button onClick={() => setViewReq(req)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="View Details"><EyeIcon className="h-5 w-5"/></button>
                       
                       {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                         <div className="flex gap-1">
                           <button onClick={() => openActionModal(req, 'PROCESSING')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Process</button>
                           <button onClick={() => openActionModal(req, 'COMPLETED')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Approve</button>
                           <button onClick={() => openActionModal(req, 'FAILED')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Reject</button>
                         </div>
                       )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW DETAILS MODAL --- */}
      {viewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative my-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center border-b border-gray-200 p-5 bg-gray-50 rounded-t-2xl">
               <h3 className="text-xl font-bold text-gray-900">Validation Details</h3>
               <button onClick={() => setViewReq(null)} className="p-1 rounded-full hover:bg-gray-200"><XMarkIcon className="h-5 w-5 text-gray-500"/></button>
             </div>
             <div className="p-6">
               {renderFullDetails(viewReq)}
             </div>
             <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
               <button onClick={() => setViewReq(null)} className="px-5 py-2 bg-white border border-gray-300 font-bold text-gray-700 rounded-lg hover:bg-gray-100">Close</button>
             </div>
          </div>
        </div>
      )}

      {/* --- ACTION MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-bold text-gray-900">Mark as {actionType}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-500"/></button>
            </div>
            <div className="space-y-4">
              
              {actionType === 'COMPLETED' && (
                <div className="space-y-2 bg-green-50 p-4 rounded-xl border border-green-100">
                  <label className="block text-xs font-bold text-green-800 uppercase flex items-center gap-2">
                    <DocumentArrowUpIcon className="h-4 w-4"/> Upload Validated Slip
                  </label>
                  <input 
                    type="file" 
                    onChange={e => setAdminFile(e.target.files?.[0] || null)} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-green-700 hover:file:bg-green-50 cursor-pointer"
                  />
                  <p className="text-[10px] text-green-600 italic">Optional: PDF or Image.</p>
                </div>
              )}

              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100">
                    <div className="flex items-center gap-2">
                       <div className="p-1 bg-red-100 rounded text-red-600"><ArrowPathIcon className="h-4 w-4"/></div>
                       <span className="text-sm font-bold text-red-800">Refund Agent?</span>
                    </div>
                    <input type="checkbox" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} className="h-5 w-5 text-red-600"/>
                 </div>
              )}

              <textarea 
                placeholder="Admin Note..." 
                className="w-full border rounded-xl p-3 text-sm focus:ring-green-500 focus:border-green-500 min-h-[100px]" 
                value={adminNote} 
                onChange={e => setAdminNote(e.target.value)} 
              />
              
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Cancel</button>
                <button onClick={handleSubmit} disabled={isProcessing || isUploading} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2">
                  {isProcessing || isUploading ? <><ArrowPathIcon className="h-5 w-5 animate-spin"/> Saving...</> : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
