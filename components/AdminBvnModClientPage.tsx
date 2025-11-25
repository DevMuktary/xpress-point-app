"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  ArrowPathIcon, 
  UserIcon, 
  PaperClipIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  formData: any; 
  newspaperUrl: string | null;
  uploadedSlipUrl: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  service: {
    name: string;
    id: string;
  };
};

export default function AdminBvnModClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null); // For Action
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null); // For Viewing Details
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Filtering
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.formData.nin || ''} ${req.formData.bvn || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setResultFile(null);
  };

  const closeActionModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const uploadResultFile = async (): Promise<string | null> => {
    if (!resultFile) return null;
    const formData = new FormData();
    formData.append('attestation', resultFile);
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

    let resultUrl = null;
    if (actionType === 'COMPLETED' && resultFile) {
      setIsUploading(true);
      resultUrl = await uploadResultFile();
      setIsUploading(false);
    }

    try {
      const res = await fetch('/api/admin/requests/process/bvn-modification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          resultUrl: resultUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: actionType } : r));
      closeActionModal();

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

  // --- Helper to render specific details ---
  const renderDetails = (req: AdminRequest) => {
    const d = req.formData;
    const type = req.service.id; // e.g., BVN_MOD_NAME

    return (
      <div className="space-y-4 text-sm text-gray-700">
        
        {/* Basic Info */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1">
          <p><strong>BVN:</strong> {d.bvn}</p>
          <p><strong>NIN:</strong> {d.nin}</p>
          <p><strong>Email:</strong> {d.email}</p>
          <p><strong>Password:</strong> <span className="font-mono bg-white px-1 rounded">{d.password}</span></p>
        </div>

        {/* Changes */}
        <div className="border rounded-lg p-3">
          <div className="font-bold text-gray-900 border-b pb-1 mb-2">Requested Changes</div>
          
          {type.includes('NAME') && (
            <div className="mb-2">
              <p className="text-xs text-gray-500">Name Change</p>
              <div className="grid grid-cols-2 gap-2">
                 <div>New First: <strong>{d.newFirstName}</strong></div>
                 <div>New Last: <strong>{d.newLastName}</strong></div>
                 {d.newMiddleName && <div>New Middle: <strong>{d.newMiddleName}</strong></div>}
              </div>
            </div>
          )}
          {type.includes('DOB') && (
             <div className="mb-2 grid grid-cols-2 gap-2">
                <div>
                   <p className="text-xs text-gray-500">Old DOB</p>
                   <strong>{d.oldDob}</strong>
                </div>
                <div>
                   <p className="text-xs text-gray-500">New DOB</p>
                   <strong className="text-blue-600">{d.newDob}</strong>
                </div>
             </div>
          )}
          {type.includes('PHONE') && (
             <div className="mb-2">
                <p className="text-xs text-gray-500">New Phone Number</p>
                <strong>{d.newPhone}</strong>
             </div>
          )}
          {type.includes('ADDRESS') && (
             <div className="mb-2">
                <p className="text-xs text-gray-500">New Address</p>
                <strong>{d.newAddress}</strong>
                <p className="text-xs">{d.lga}, {d.state}</p>
             </div>
          )}
        </div>

        {/* Documents */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h5 className="text-sm font-bold text-gray-700 mb-2">Attached Documents</h5>
          <div className="flex flex-wrap gap-3">
            {req.uploadedSlipUrl && (
              <a href={req.uploadedSlipUrl} target="_blank" className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100">
                <UserIcon className="h-4 w-4"/> Passport
              </a>
            )}
            {d.attestationUrl && (
              <a href={d.attestationUrl} target="_blank" className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100">
                <PaperClipIcon className="h-4 w-4"/> Attestation
              </a>
            )}
            {req.newspaperUrl && (
              <a href={req.newspaperUrl} target="_blank" className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100">
                <PaperClipIcon className="h-4 w-4"/> Newspaper
              </a>
            )}
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
             type="text" placeholder="Search Name, BVN, or NIN..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filterStatus === s ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>{s}</button>
          ))}
        </div>
        <button onClick={() => alert("Export logic here")} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">Export CSV</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
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
                    <div className="text-xs text-gray-500">{req.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">{req.service.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <div><h3 className="text-xl font-bold text-gray-900">Request Details</h3><p className="text-sm text-gray-500">{viewReq.service.name}</p></div>
              <button onClick={() => setViewReq(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"><XMarkIcon className="h-6 w-6 text-gray-600"/></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6"><span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewReq.status)}`}>Status: {viewReq.status}</span></div>
              {renderDetails(viewReq)}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setViewReq(null)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100">Close</button>
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
              <button onClick={closeActionModal} className="p-1 hover:bg-gray-100 rounded-full"><XCircleIcon className="h-6 w-6 text-gray-500"/></button>
            </div>
            <div className="space-y-4">
              {actionType === 'COMPLETED' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Result (PDF/Image)</label>
                  <input type="file" onChange={e => setResultFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700"/>
                </div>
              )}
              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-800">Refund User?</span>
                    <input type="checkbox" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} className="h-5 w-5 text-red-600"/>
                 </div>
              )}
              <textarea placeholder="Admin Note..." className="w-full border rounded-lg p-2 text-sm" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
              <div className="flex gap-3 pt-2">
                <button onClick={closeActionModal} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
                <button onClick={handleSubmit} disabled={isProcessing || isUploading} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">{isProcessing || isUploading ? 'Saving...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
