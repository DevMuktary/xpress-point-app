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
  BriefcaseIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  formData: any;
  statusReportUrl: string | null; // User upload (Business)
  certificateUrl: string | null;  // Admin upload (Result)
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  service: {
    name: string;
    id: string;
  };
};

export default function AdminTinClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null); 
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null); 
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filtering
  const filteredRequests = requests.filter(req => {
    const d = req.formData;
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${d.firstName || ''} ${d.bizName || ''} ${d.bvn || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setCertificateFile(null);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const uploadResultFile = async (): Promise<string | null> => {
    if (!certificateFile) return null;
    const formData = new FormData();
    formData.append('attestation', certificateFile);
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

    let certUrl = null;
    if (actionType === 'COMPLETED' && certificateFile) {
      setIsUploading(true);
      certUrl = await uploadResultFile();
      setIsUploading(false);
    }

    try {
      const res = await fetch('/api/admin/requests/process/tin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          certificateUrl: certUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { 
        ...r, 
        status: actionType,
        certificateUrl: certUrl || r.certificateUrl
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

  const renderDetails = (req: AdminRequest) => {
    const d = req.formData;
    const isBusiness = req.service.id.includes('BUSINESS');
    const isPersonal = req.service.id.includes('PERSONAL');

    return (
      <div className="space-y-4 text-sm text-gray-700">
        
        {/* Personal Info */}
        {isPersonal && (
           <div className="bg-blue-50 p-3 rounded border border-blue-200">
             <p className="font-bold text-blue-900 border-b border-blue-200 pb-1 mb-2">Personal Info</p>
             <div className="grid grid-cols-2 gap-2">
                <p><strong>Name:</strong> {d.firstName || d.fullName} {d.lastName} {d.middleName}</p>
                <p><strong>Phone:</strong> {d.phone}</p>
                <p><strong>Email:</strong> {d.email}</p>
                {d.bvn && <p><strong>BVN:</strong> {d.bvn}</p>}
                {d.nin && <p><strong>NIN:</strong> {d.nin}</p>}
                {d.bvnOrNin && <p><strong>BVN/NIN:</strong> {d.bvnOrNin}</p>}
                {d.dob && <p><strong>DOB:</strong> {d.dob}</p>}
             </div>
             {d.address && (
               <div className="mt-2 pt-2 border-t border-blue-200">
                  <p><strong>Address:</strong> {d.address}</p>
                  <p>{d.lga}, {d.state}</p>
               </div>
             )}
           </div>
        )}

        {/* Business Info */}
        {isBusiness && (
           <div className="bg-teal-50 p-3 rounded border border-teal-200">
             <p className="font-bold text-teal-900 border-b border-teal-200 pb-1 mb-2">Business Info</p>
             <p><strong>Business Name:</strong> {d.bizName}</p>
             <p><strong>RC/BN Number:</strong> {d.bizNumber}</p>
             {d.incorpDate && <p><strong>Incorp Date:</strong> {d.incorpDate}</p>}
           </div>
        )}

        {/* User Uploads */}
        {req.statusReportUrl && (
           <div className="mt-4 pt-4 border-t border-gray-100">
             <h5 className="text-sm font-bold text-gray-700 mb-2">User Documents</h5>
             <a href={req.statusReportUrl} target="_blank" className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 w-fit">
               <DocumentArrowDownIcon className="h-4 w-4"/> View Status Report
             </a>
           </div>
        )}
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
             type="text" placeholder="Search Name, Biz Name, BVN..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filterStatus === s ? 'bg-white shadow text-teal-600' : 'text-gray-500'}`}>{s}</button>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
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
                  <td className="px-6 py-4 text-xs text-gray-600">{req.service.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-800">
                    {req.formData.firstName || req.formData.bizName || req.formData.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     <div className="flex justify-end items-center gap-2">
                       <button onClick={() => setViewReq(req)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"><EyeIcon className="h-5 w-5"/></button>
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
               <h3 className="text-xl font-bold text-gray-900">TIN Details</h3>
               <button onClick={() => setViewReq(null)} className="p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6 text-gray-600"/></button>
             </div>
             <div className="p-6 max-h-[70vh] overflow-y-auto">
               {renderDetails(viewReq)}
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
              {actionType === 'COMPLETED' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Certificate (PDF)</label>
                  <input type="file" onChange={e => setCertificateFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700"/>
                </div>
              )}
              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-800">Refund User?</span>
                    <input type="checkbox" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} className="h-5 w-5 text-red-600"/>
                 </div>
              )}
              <textarea placeholder="Admin Note..." className="w-full border rounded-lg p-2 text-sm min-h-[80px]" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
                <button onClick={handleSubmit} disabled={isProcessing || isUploading} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">{isProcessing || isUploading ? 'Saving...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

