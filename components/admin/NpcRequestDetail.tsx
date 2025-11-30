"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon, 
  EyeIcon, UserIcon, MapPinIcon, DocumentTextIcon, ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  statusMessage: string | null;
  formData: any;
  affidavitUrl: string | null;
  certificateUrl: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminNpcRequestsClientPage({ initialRequests }: { initialRequests: any[] }) {
  
  const [requests, setRequests] = useState<AdminRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null);
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null); 
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredRequests = requests.filter(req => {
    const d = req.formData;
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${d.surname} ${d.firstName}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setCertFile(null);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const uploadCertificate = async (): Promise<string | null> => {
    if (!certFile) return null;
    const formData = new FormData();
    formData.append('attestation', certFile); 
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

    let certificateUrl = null;
    if (actionType === 'COMPLETED' && certFile) {
      setIsUploading(true);
      certificateUrl = await uploadCertificate();
      setIsUploading(false);
      if (!certificateUrl) {
          setIsProcessing(false);
          return; // Stop if upload failed
      }
    }

    try {
      const res = await fetch('/api/admin/npc/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          certificateUrl: certificateUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      // Optimistic update
      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { 
          ...r, 
          status: actionType,
          certificateUrl: certificateUrl || r.certificateUrl // Keep old if not new
      } : r));
      
      closeModal();

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

  // --- Render Full Details (Similar to your BVN example) ---
  const renderFullDetails = (req: AdminRequest) => {
    const d = req.formData;
    return (
      <div className="space-y-6 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-2">
        
        {/* Documents */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
           <h4 className="text-xs font-bold text-indigo-800 uppercase mb-3 flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4"/> Documents
           </h4>
           {req.affidavitUrl ? (
              <a href={req.affidavitUrl} target="_blank" className="text-blue-600 underline text-xs font-bold">
                 Download Affidavit
              </a>
           ) : <span className="text-red-500 text-xs">Missing Affidavit</span>}
        </div>

        {/* Personal Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Applicant Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div><span className="block text-xs text-gray-400">Surname</span><span className="font-bold">{d.surname}</span></div>
            <div><span className="block text-xs text-gray-400">First Name</span><span className="font-bold">{d.firstName}</span></div>
            <div><span className="block text-xs text-gray-400">Middle Name</span><span>{d.middleName || '-'}</span></div>
            <div><span className="block text-xs text-gray-400">DOB</span><span>{d.dob}</span></div>
            <div><span className="block text-xs text-gray-400">Sex</span><span>{d.sex}</span></div>
            <div><span className="block text-xs text-gray-400">Marital Status</span><span>{d.maritalStatus}</span></div>
            <div><span className="block text-xs text-gray-400">Phone</span><span>{d.phone}</span></div>
            <div><span className="block text-xs text-gray-400">Email</span><span>{d.email}</span></div>
          </div>
        </div>

        {/* Origin & Birth */}
        <div className="border p-4 rounded-lg">
           <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Origin & Birth Data</h4>
           <div className="grid grid-cols-2 gap-4">
              <div><span className="block text-xs text-gray-400">State of Origin</span>{d.stateOrigin}</div>
              <div><span className="block text-xs text-gray-400">LGA of Origin</span>{d.lgaOrigin}</div>
              <div><span className="block text-xs text-gray-400">Town</span>{d.town}</div>
              <div><span className="block text-xs text-gray-400">Birth Place</span>{d.birthPlace}</div>
           </div>
        </div>

        {/* Parents */}
        <div className="border p-4 rounded-lg">
           <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Parents</h4>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-2 rounded">
                 <span className="block text-xs font-bold text-gray-500 mb-1">Father</span>
                 <p>{d.fatherSurname} {d.fatherFirst}</p>
                 <p className="text-xs text-gray-400">{d.fatherState}, {d.fatherLga}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                 <span className="block text-xs font-bold text-gray-500 mb-1">Mother</span>
                 <p>{d.motherSurname} {d.motherFirst}</p>
                 <p className="text-xs text-gray-400">{d.motherState}, {d.motherLga}</p>
              </div>
           </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" placeholder="Search Applicant Name..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filterStatus === s ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>{s}</button>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                    {req.formData.surname} {req.formData.firstName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                     <div className="flex justify-end items-center gap-2">
                       <button onClick={() => setViewReq(req)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"><EyeIcon className="h-5 w-5"/></button>
                       {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                         <div className="flex gap-1">
                           <button onClick={() => openActionModal(req, 'PROCESSING')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Process</button>
                           <button onClick={() => openActionModal(req, 'COMPLETED')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Done</button>
                           <button onClick={() => openActionModal(req, 'FAILED')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Fail</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative my-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center border-b border-gray-200 p-5">
               <h3 className="text-xl font-bold text-gray-900">NPC Request Details</h3>
               <button onClick={() => setViewReq(null)} className="p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6 text-gray-600"/></button>
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
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">Mark as {actionType}</h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-500"/></button>
            </div>
            <div className="space-y-4">
              
              {/* Certificate Upload for COMPLETED */}
              {actionType === 'COMPLETED' && (
                <div className="space-y-2 bg-green-50 p-3 rounded border border-green-100">
                  <label className="block text-xs font-bold text-green-800 uppercase">Upload Certificate (PDF/Image)</label>
                  <input 
                    type="file" 
                    onChange={e => setCertFile(e.target.files?.[0] || null)} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-200 file:text-green-800 hover:file:bg-green-300"
                  />
                </div>
              )}

              {/* Refund Option for FAILED */}
              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-800">Refund User?</span>
                    <input type="checkbox" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} className="h-5 w-5 text-red-600"/>
                 </div>
              )}

              <textarea placeholder="Admin Note (Optional)..." className="w-full border rounded-lg p-2 text-sm min-h-[80px]" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
              
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
                <button onClick={handleSubmit} disabled={isProcessing || isUploading} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {isProcessing || isUploading ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
