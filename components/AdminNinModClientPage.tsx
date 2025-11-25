"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  PaperClipIcon,
  IdentificationIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  formData: any; // Contains all the user inputs
  attestationUrl: string | null;
  uploadedSlipUrl: string | null;
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
  const [shouldRefund, setShouldRefund] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Filtering ---
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.formData.nin || ''} ${req.service.name}`.toLowerCase();
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

      if (!res.ok) throw new Error("Failed to process request");

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

  // --- Helper to render form details based on category ---
  const renderDetails = (req: AdminRequest) => {
    const d = req.formData;
    
    return (
      <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="col-span-2 bg-gray-50 p-2 rounded border border-gray-200 font-mono text-center font-bold">
          NIN: {d.nin}
        </div>

        {/* Name Section */}
        {(d.newFirstName || d.newLastName) && (
          <>
             <div className="col-span-2 font-bold text-gray-900 border-b pb-1 mt-2">Name Correction</div>
             <div>
               <span className="block text-xs text-gray-500">New First Name</span>
               {d.newFirstName}
             </div>
             <div>
               <span className="block text-xs text-gray-500">New Last Name</span>
               {d.newLastName}
             </div>
             {d.newMiddleName && (
               <div>
                 <span className="block text-xs text-gray-500">New Middle Name</span>
                 {d.newMiddleName}
               </div>
             )}
          </>
        )}

        {/* DOB Section */}
        {(d.newDob) && (
          <>
             <div className="col-span-2 font-bold text-gray-900 border-b pb-1 mt-2">Date of Birth</div>
             <div>
               <span className="block text-xs text-gray-500">Old DOB</span>
               {d.oldDob}
             </div>
             <div>
               <span className="block text-xs text-gray-500 font-bold text-blue-600">New DOB</span>
               {d.newDob}
             </div>
          </>
        )}

        {/* Phone Section */}
        {(d.newPhone) && (
          <>
             <div className="col-span-2 font-bold text-gray-900 border-b pb-1 mt-2">Phone Number</div>
             <div className="col-span-2">
               <span className="block text-xs text-gray-500">New Phone</span>
               {d.newPhone}
             </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 max-w-md">
           <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
           <input 
             type="text" 
             placeholder="Search Name, NIN, Service..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
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

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Summary</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Docs</th>
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
                  <td className="px-6 py-4 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg">
                    {req.service.name}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                    NIN: {req.formData.nin}
                  </td>
                  <td className="px-6 py-4 text-xs space-y-1">
                    {req.uploadedSlipUrl && (
                      <a href={req.uploadedSlipUrl} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                        <UserIcon className="h-3 w-3" /> Passport
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
                     <div className="flex justify-end gap-2">
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
                     </div>
                     {req.status === 'COMPLETED' && req.formData.resultUrl && (
                       <div className="mt-1">
                         <a href={req.formData.resultUrl} target="_blank" className="text-xs font-bold text-green-700 underline">
                           View Result
                         </a>
                       </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative my-8">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">Process Request</h3>
                 <p className="text-sm text-gray-500">{selectedReq.service.name}</p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-full"><XCircleIcon className="h-6 w-6 text-gray-500"/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* LEFT: Request Details */}
              <div className="space-y-4 border-r border-gray-100 pr-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">User Submission</h4>
                {renderDetails(selectedReq)}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h5 className="text-sm font-bold text-gray-700 mb-2">Attachments</h5>
                  <div className="flex gap-4">
                    {selectedReq.uploadedSlipUrl && (
                      <a href={selectedReq.uploadedSlipUrl} target="_blank" className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                        <UserIcon className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-blue-600 underline mt-1">Passport</span>
                      </a>
                    )}
                    {selectedReq.attestationUrl && (
                      <a href={selectedReq.attestationUrl} target="_blank" className="flex flex-col items-center p-2 border rounded hover:bg-gray-50">
                        <PaperClipIcon className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-blue-600 underline mt-1">Attestation</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Action Form */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Admin Action</h4>
                
                <div className={`p-3 rounded-lg text-sm font-semibold text-center
                  ${actionType === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 
                    actionType === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                    'bg-red-100 text-red-700'}`}>
                  Marking as: {actionType}
                </div>

                {/* Success State: Upload */}
                {actionType === 'COMPLETED' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Upload Result File (PDF/Image)</label>
                    <input 
                      type="file" 
                      onChange={e => setResultFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    <p className="text-xs text-gray-500">The user will be able to download this.</p>
                  </div>
                )}

                {/* Failed State: Refund */}
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
                  placeholder={actionType === 'FAILED' ? "Reason for rejection..." : "Admin note (Optional)..."}
                  className="w-full border rounded-lg p-2 text-sm min-h-[100px]"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />

                <button 
                  onClick={handleSubmit}
                  disabled={isProcessing || isUploading || (actionType === 'FAILED' && !adminNote)}
                  className={`w-full py-3 text-sm font-bold text-white rounded-lg shadow-md transition-all
                    ${actionType === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : 
                      actionType === 'FAILED' ? 'bg-red-600 hover:bg-red-700' : 
                      'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isProcessing || isUploading ? 'Processing...' : 'Confirm Update'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
