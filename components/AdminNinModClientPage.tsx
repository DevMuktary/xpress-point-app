"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  PaperClipIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  formData: any;
  attestationUrl: string | null;
  uploadedSlipUrl: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  service: {
    name: string;
  };
};

export default function AdminNinModClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Modal State ---
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false); // Default No Refund
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Filtering ---
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.formData.nin || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Open Modal ---
  const openModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setResultFile(null);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  // --- File Upload Helper ---
  const uploadResultFile = async (): Promise<string | null> => {
    if (!resultFile) return null;
    
    const formData = new FormData();
    formData.append('attestation', resultFile); // Reusing your existing upload API

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    } catch (e) {
      alert("File upload failed");
      return null;
    }
  };

  // --- Submit Process ---
  const handleSubmit = async () => {
    if (!selectedReq || !actionType) return;
    setIsProcessing(true);

    let resultUrl = null;
    if (actionType === 'COMPLETED' && resultFile) {
      setIsUploading(true);
      resultUrl = await uploadResultFile();
      setIsUploading(false);
      
      if (!resultUrl) {
        setIsProcessing(false);
        return; // Stop if upload failed
      }
    }

    try {
      const res = await fetch('/api/admin/requests/process/nin-mod', {
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

      // Update Local State
      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: actionType } : r));
      closeModal();
      alert("Request updated successfully!");

    } catch (error) {
      alert("An error occurred.");
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

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search by Name or NIN..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === s ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                    <div className="text-xs text-gray-500">{req.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {req.service.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    <div className="space-y-1">
                      <p><strong>NIN:</strong> {req.formData.nin}</p>
                      {req.formData.newFirstName && <p>New Name: {req.formData.newFirstName} {req.formData.newLastName}</p>}
                      {req.formData.newDob && <p>New DOB: {req.formData.newDob}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs space-y-1">
                    {req.uploadedSlipUrl && (
                      <a href={req.uploadedSlipUrl} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                        <PaperClipIcon className="h-3 w-3" /> Passport
                      </a>
                    )}
                    {req.attestationUrl && (
                      <a href={req.attestationUrl} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                        <PaperClipIcon className="h-3 w-3" /> Attestation
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     {/* Action Buttons */}
                     {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                       <>
                         <button 
                           onClick={() => openModal(req, 'PROCESSING')}
                           className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                         >
                           Process
                         </button>
                         <button 
                           onClick={() => openModal(req, 'COMPLETED')}
                           className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                         >
                           Complete
                         </button>
                         <button 
                           onClick={() => openModal(req, 'FAILED')}
                           className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                         >
                           Fail
                         </button>
                       </>
                     )}
                     {req.status === 'COMPLETED' && req.formData.resultUrl && (
                       <a href={req.formData.resultUrl} target="_blank" className="inline-block text-xs text-green-700 underline">
                         View Result
                       </a>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PROCESS MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Mark as {actionType}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Updating request for {selectedReq.user.firstName}
            </p>

            {/* 1. Processing State */}
            {actionType === 'PROCESSING' && (
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                This will notify the user that you are working on their request.
              </p>
            )}

            {/* 2. Success State (Upload) */}
            {actionType === 'COMPLETED' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Result (PDF/Image)</label>
                  <input 
                    type="file" 
                    onChange={e => setResultFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                <textarea
                  placeholder="Optional Success Note (e.g. Tracking ID)"
                  className="w-full border rounded-lg p-2 text-sm"
                  rows={2}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
              </div>
            )}

            {/* 3. Failed State (Refund Toggle) */}
            {actionType === 'FAILED' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                  <span className="text-sm font-bold text-red-800">Refund User?</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={shouldRefund} 
                      onChange={e => setShouldRefund(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <textarea
                  placeholder="Reason for rejection (Required)"
                  className="w-full border rounded-lg p-2 text-sm"
                  rows={3}
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={closeModal} className="flex-1 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isProcessing || isUploading || (actionType === 'FAILED' && !adminNote)}
                className={`flex-1 py-2 text-sm font-bold text-white rounded-lg 
                  ${actionType === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 
                    actionType === 'FAILED' ? 'bg-red-600 hover:bg-red-700' : 
                    'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isProcessing || isUploading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
