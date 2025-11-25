"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XCircleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  nin: string;
  statusMessage: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminNinDelinkClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // --- Modal State ---
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Filtering ---
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.nin}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Actions ---
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

  // --- File Upload ---
  const uploadResultFile = async (): Promise<string | null> => {
    if (!resultFile) return null;
    const formData = new FormData();
    formData.append('attestation', resultFile); // Reusing existing upload route
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url;
    } catch (e) {
      alert("File upload failed");
      return null;
    }
  };

  // --- Submit ---
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
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/requests/process/nin-delink', {
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
      closeModal();

    } catch (error) {
      alert("An error occurred while processing.");
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
             placeholder="Search Agent Name or NIN..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button 
              key={s} 
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === s ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">NIN to Delink</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                    <div className="text-xs text-gray-500">{req.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 w-fit">
                      <IdentificationIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-mono font-medium text-gray-700">{req.nin}</span>
                    </div>
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
                           Done
                         </button>
                         <button 
                           onClick={() => openModal(req, 'FAILED')}
                           className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                         >
                           Fail
                         </button>
                       </>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative my-8">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">
                   Mark as {actionType}
                 </h3>
                 <p className="text-sm text-gray-500">{selectedReq.user.firstName} - {selectedReq.nin}</p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><XCircleIcon className="h-6 w-6 text-gray-500"/></button>
            </div>

            <div className="space-y-4">
              
              {actionType === 'PROCESSING' && (
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  Notify agent that work has started.
                </p>
              )}

              {actionType === 'COMPLETED' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Upload Proof (Optional)</label>
                  <input 
                    type="file" 
                    onChange={e => setResultFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-600 file:text-white hover:file:bg-green-700"
                  />
                </div>
              )}

              {actionType === 'FAILED' && (
                <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                  <div>
                    <span className="text-sm font-bold text-red-800 block">Refund User?</span>
                    <span className="text-xs text-red-600">Reverses the wallet charge.</span>
                  </div>
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
              )}

              <textarea
                placeholder={actionType === 'FAILED' ? "Reason for rejection..." : "Admin note / Result text..."}
                className="w-full border rounded-lg p-2 text-sm min-h-[100px]"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
              />

              <div className="flex gap-3 mt-2">
                <button 
                  onClick={closeModal} 
                  className="flex-1 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isProcessing || isUploading || (actionType === 'FAILED' && !adminNote)}
                  className={`flex-1 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-all
                    ${actionType === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 
                      actionType === 'FAILED' ? 'bg-red-600 hover:bg-red-700' : 
                      'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isProcessing || isUploading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
