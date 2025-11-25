"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XCircleIcon, 
  CheckCircleIcon,
  ArrowPathIcon,
  UserIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  formData: any; 
  failedEnrollmentUrl: string | null; // For CRM
  createdAt: string;
  retrievalResult: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  service: {
    name: string;
  };
};

export default function AdminBvnRetrievalClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal State
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [retrievedBvn, setRetrievedBvn] = useState(''); // For the text box
  const [resultFile, setResultFile] = useState<File | null>(null); // Optional file
  const [isUploading, setIsUploading] = useState(false);

  // Filtering
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.user.email}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setRetrievedBvn('');
    setResultFile(null);
  };

  const closeModal = () => {
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
    if (actionType === 'COMPLETED') {
      // Validate BVN Input
      if (!retrievedBvn) {
        alert("Please enter the Retrieved BVN Number.");
        setIsProcessing(false);
        return;
      }
      
      if (resultFile) {
        setIsUploading(true);
        resultUrl = await uploadResultFile();
        setIsUploading(false);
      }
    }

    try {
      const res = await fetch('/api/admin/requests/process/bvn-retrieval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          retrievedBvn: retrievedBvn,
          resultUrl: resultUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { 
        ...r, 
        status: actionType,
        retrievalResult: retrievedBvn || r.retrievalResult // Update local state to show instantly
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" placeholder="Search Agent Name..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filterStatus === s ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.user.firstName} {req.user.lastName}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {req.service.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700 space-y-1">
                    {req.formData.phone && <p><strong>Phone:</strong> {req.formData.phone}</p>}
                    {req.formData.fullName && <p><strong>Name:</strong> {req.formData.fullName}</p>}
                    {req.formData.agentCode && <p><strong>Agent Code:</strong> {req.formData.agentCode}</p>}
                    {req.formData.ticketId && <p><strong>Ticket ID:</strong> {req.formData.ticketId}</p>}
                    
                    {req.failedEnrollmentUrl && (
                      <a href={req.failedEnrollmentUrl} target="_blank" className="text-blue-600 underline flex items-center gap-1">
                        <PaperClipIcon className="h-3 w-3"/> View Screenshot
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                    {req.retrievalResult && (
                      <div className="mt-1 font-mono font-bold text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                        {req.retrievalResult}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                       <div className="flex justify-end gap-2">
                         <button onClick={() => openModal(req, 'PROCESSING')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">Process</button>
                         <button onClick={() => openModal(req, 'COMPLETED')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">Complete</button>
                         <button onClick={() => openModal(req, 'FAILED')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">Fail</button>
                       </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Mark as {actionType}</h3>
            
            <div className="space-y-4">
              {actionType === 'COMPLETED' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Retrieved BVN*</label>
                    <input 
                      type="text" 
                      className="w-full border-2 border-green-200 rounded-lg p-3 text-lg font-mono font-bold focus:border-green-500 focus:ring-green-500"
                      placeholder="Enter BVN here..."
                      value={retrievedBvn}
                      onChange={e => setRetrievedBvn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Slip (Optional)</label>
                    <input type="file" onChange={e => setResultFile(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-50 file:text-green-700"/>
                  </div>
                </>
              )}

              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-800">Refund User?</span>
                    <input type="checkbox" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} className="h-5 w-5 text-red-600"/>
                 </div>
              )}

              <textarea 
                placeholder="Admin Note..." 
                className="w-full border rounded-lg p-2 text-sm" 
                value={adminNote} 
                onChange={e => setAdminNote(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isProcessing || isUploading || (actionType === 'COMPLETED' && !retrievedBvn)}
                  className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
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
