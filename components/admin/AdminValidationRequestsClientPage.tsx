"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  EyeIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  DocumentArrowUpIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type AdminRequest = {
  id: string;
  nin: string;
  scode: string; // This stores the type: 'NO_RECORD' or 'UPDATE_RECORD'
  status: string;
  createdAt: string | Date;
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
  
  // Modal State
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  const [actionType, setActionType] = useState<'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [adminFile, setAdminFile] = useState<File | null>(null); // For uploading proof if needed
  const [isUploading, setIsUploading] = useState(false);

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.nin}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  // Open Modal
  const openActionModal = (req: AdminRequest, action: 'COMPLETED' | 'FAILED') => {
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

  // Handle File Upload (Optional)
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

  // Submit Logic
  const handleSubmit = async () => {
    if (!selectedReq || !actionType) return;
    setIsProcessing(true);

    let fileUrl = null;
    if (actionType === 'COMPLETED' && adminFile) {
      setIsUploading(true);
      fileUrl = await uploadProof();
      setIsUploading(false);
      if (!fileUrl && adminFile) {
        setIsProcessing(false);
        return; // Upload failed
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

      // Remove processed request from list (since we only show PENDING)
      setRequests(prev => prev.filter(r => r.id !== selectedReq.id));
      closeModal();
      router.refresh();

    } catch (error) {
      alert("Error processing request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeLabel = (scode: string) => {
    if (scode === 'NO_RECORD') return 'No Record Found';
    if (scode === 'UPDATE_RECORD') return 'Record Update';
    return scode;
  };

  return (
    <div className="space-y-6">
      
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" placeholder="Search NIN or Agent Name..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm focus:ring-blue-500"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">NIN</th>
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
                    <div className="text-xs text-gray-500">{req.user.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getTypeLabel(req.scode)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono font-bold text-gray-800">
                    {req.nin}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end gap-2">
                       <button 
                         onClick={() => openActionModal(req, 'COMPLETED')} 
                         className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                       >
                         <CheckCircleIcon className="h-4 w-4"/> Approve
                       </button>
                       <button 
                         onClick={() => openActionModal(req, 'FAILED')} 
                         className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                       >
                         <XMarkIcon className="h-4 w-4"/> Reject
                       </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No pending validation requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PROCESS MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {actionType === 'COMPLETED' ? 'Approve Validation' : 'Reject Validation'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">NIN: {selectedReq.nin}</p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="h-6 w-6 text-gray-400"/>
              </button>
            </div>

            <div className="space-y-5">
              
              {/* Upload File (Optional for Completed) */}
              {actionType === 'COMPLETED' && (
                <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                    <DocumentArrowUpIcon className="h-4 w-4"/> Upload Result (Optional)
                  </label>
                  <input 
                    type="file" 
                    onChange={e => setAdminFile(e.target.files?.[0] || null)} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-blue-700 hover:file:bg-blue-50"
                  />
                  <p className="text-[10px] text-blue-600">Upload screenshot or PDF if required.</p>
                </div>
              )}

              {/* Refund Checkbox (For Failed) */}
              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-800">Refund User?</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                 </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note / Response</label>
                <textarea 
                  placeholder={actionType === 'COMPLETED' ? "e.g., Validation successful. Data updated." : "e.g., Invalid NIN provided."}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 min-h-[100px]" 
                  value={adminNote} 
                  onChange={e => setAdminNote(e.target.value)} 
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={closeModal} 
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isProcessing || isUploading} 
                  className={`flex-1 py-3 font-bold rounded-lg text-white shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2
                    ${actionType === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
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
