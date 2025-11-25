"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  PaperClipIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowDownTrayIcon,
  XMarkIcon
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
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null); // For "View Details" only
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Filtering ---
  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.formData.nin || ''} ${req.service.name}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Export Function ---
  const handleExport = () => {
    if (filteredRequests.length === 0) return alert("No data to export");

    // Define CSV Headers
    const headers = [
      "Date",
      "Agent Name",
      "Agent Email",
      "Service Type",
      "NIN",
      "Status",
      "New Name (if applicable)",
      "New DOB (if applicable)",
      "New Phone (if applicable)"
    ];

    // Map Data to Rows
    const rows = filteredRequests.map(req => {
      const d = req.formData;
      const newName = d.newName || `${d.newFirstName || ''} ${d.newLastName || ''}`.trim();
      
      return [
        `"${new Date(req.createdAt).toLocaleDateString()}"`,
        `"${req.user.firstName} ${req.user.lastName}"`,
        `"${req.user.email}"`,
        `"${req.service.name}"`,
        `"${d.nin || ''}"`,
        `"${req.status}"`,
        `"${newName}"`,
        `"${d.newDob || ''}"`,
        `"${d.newPhone || ''}"`
      ].join(",");
    });

    // Create CSV Content
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    
    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nin_mod_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Actions ---
  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setResultFile(null);
    setShowPassword(false);
  };

  const closeActionModal = () => {
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
      closeActionModal();

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

  // --- Render Details Helper ---
  const renderDetails = (req: AdminRequest) => {
    const d = req.formData;
    
    return (
      <div className="space-y-4 text-sm text-gray-700">
        
        {/* 1. Basic Info Block */}
        <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">NIN Number:</span>
            <span className="font-mono font-bold">{d.nin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Contact Phone:</span>
            <span className="font-bold">{d.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Portal Email:</span>
            <span className="font-bold">{d.email}</span>
          </div>
          
          {/* Password Toggle */}
          {d.password && (
            <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
               <span className="text-gray-500">Portal Password:</span>
               <div className="flex items-center gap-2">
                 <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border">
                   {showPassword ? d.password : '••••••••'}
                 </span>
                 <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700">
                   {showPassword ? <EyeSlashIcon className="h-4 w-4"/> : <EyeIcon className="h-4 w-4"/>}
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* 2. Service Specific Changes */}
        
        {/* Name Correction */}
        {(d.firstName || d.lastName || d.oldName) && (
          <div className="border rounded-lg p-3">
             <div className="font-bold text-gray-900 border-b pb-1 mb-2">Name Correction</div>
             <div className="grid grid-cols-2 gap-2">
               <div className="col-span-2">
                 <span className="block text-xs text-gray-500">Old Full Name</span>
                 <div className="font-medium">{d.oldName}</div>
               </div>
               <div>
                 <span className="block text-xs text-gray-500">New First Name</span>
                 <div className="font-medium">{d.firstName || d.newFirstName}</div>
               </div>
               <div>
                 <span className="block text-xs text-gray-500">New Last Name</span>
                 <div className="font-medium">{d.lastName || d.newLastName}</div>
               </div>
               {d.middleName && (
                 <div className="col-span-2">
                   <span className="block text-xs text-gray-500">New Middle Name</span>
                   <div className="font-medium">{d.middleName || d.newMiddleName}</div>
                 </div>
               )}
             </div>
          </div>
        )}

        {/* DOB Correction */}
        {(d.newDob || d.oldDob) && (
          <div className="border rounded-lg p-3">
             <div className="font-bold text-gray-900 border-b pb-1 mb-2">Date of Birth</div>
             <div className="grid grid-cols-2 gap-2">
               <div>
                 <span className="block text-xs text-gray-500">Old DOB</span>
                 <div className="font-medium">{d.oldDob}</div>
               </div>
               <div>
                 <span className="block text-xs text-gray-500 font-bold text-blue-600">New DOB</span>
                 <div className="font-bold text-blue-600">{d.newDob}</div>
               </div>
             </div>
          </div>
        )}

        {/* Phone Correction */}
        {(d.newPhone || d.oldPhone) && (
          <div className="border rounded-lg p-3">
             <div className="font-bold text-gray-900 border-b pb-1 mb-2">Phone Change</div>
             <div className="grid grid-cols-2 gap-2">
               <div>
                 <span className="block text-xs text-gray-500">Old Phone</span>
                 <div className="font-medium">{d.oldPhone}</div>
               </div>
               <div>
                 <span className="block text-xs text-gray-500">New Phone</span>
                 <div className="font-medium">{d.newPhone}</div>
               </div>
             </div>
          </div>
        )}

        {/* Address Correction */}
        {(d.newAddress || d.address) && (
          <div className="border rounded-lg p-3">
             <div className="font-bold text-gray-900 border-b pb-1 mb-2">Address Change</div>
             <div className="space-y-2">
               <div>
                 <span className="block text-xs text-gray-500">Old Address</span>
                 <div className="font-medium">{d.oldAddress}</div>
               </div>
               <div>
                 <span className="block text-xs text-gray-500 font-bold text-blue-600">New Address</span>
                 <div className="font-medium text-blue-600">{d.newAddress || d.address}</div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <div>
                   <span className="block text-xs text-gray-500">State</span>
                   <div className="font-medium">{d.state}</div>
                 </div>
                 <div>
                   <span className="block text-xs text-gray-500">LGA</span>
                   <div className="font-medium">{d.lga}</div>
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Documents Links */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h5 className="text-sm font-bold text-gray-700 mb-2">Attachments</h5>
          <div className="flex flex-wrap gap-4">
            {req.uploadedSlipUrl && (
              <a href={req.uploadedSlipUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors">
                <UserIcon className="h-4 w-4" /> Passport Photo
              </a>
            )}
            {req.attestationUrl && (
              <a href={req.attestationUrl} target="_blank" className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors">
                <PaperClipIcon className="h-4 w-4" /> Attestation Letter
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Controls Header */}
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
        <div className="flex gap-2">
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
          {/* Export Button */}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">NIN</th>
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
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                      {req.service.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                    {req.formData.nin}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                     <div className="flex justify-end items-center gap-2">
                       
                       {/* VIEW BUTTON (The new feature) */}
                       <button 
                         onClick={() => setViewReq(req)}
                         className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                         title="View Details"
                       >
                         <EyeIcon className="h-5 w-5" />
                       </button>

                       {/* ACTION BUTTONS (Only if active) */}
                       {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                         <div className="flex gap-1">
                           <button 
                             onClick={() => openActionModal(req, 'PROCESSING')}
                             className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100"
                           >
                             Process
                           </button>
                           <button 
                             onClick={() => openActionModal(req, 'COMPLETED')}
                             className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100"
                           >
                             Done
                           </button>
                           <button 
                             onClick={() => openActionModal(req, 'FAILED')}
                             className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100"
                           >
                             Fail
                           </button>
                         </div>
                       )}
                       
                       {/* DOWNLOAD RESULT LINK */}
                       {req.status === 'COMPLETED' && req.formData.resultUrl && (
                         <a 
                           href={req.formData.resultUrl} 
                           target="_blank" 
                           className="text-xs font-bold text-green-700 hover:underline bg-green-50 px-2 py-1 rounded"
                         >
                           Result
                         </a>
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
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-200 p-6">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                 <p className="text-sm text-gray-500">ID: {viewReq.id}</p>
              </div>
              <button 
                onClick={() => setViewReq(null)} 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600"/>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(viewReq.status)}`}>
                  Status: {viewReq.status}
                </span>
              </div>
              
              {renderDetails(viewReq)}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={() => setViewReq(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROCESS ACTION MODAL --- */}
      {selectedReq && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                 <h3 className="text-xl font-bold text-gray-900">
                   Mark as {actionType}
                 </h3>
                 <p className="text-sm text-gray-500">{selectedReq.user.firstName} {selectedReq.user.lastName}</p>
              </div>
              <button onClick={closeActionModal} className="p-1 hover:bg-gray-100 rounded-full">
                <XCircleIcon className="h-6 w-6 text-gray-500"/>
              </button>
            </div>

            <div className="space-y-4">
              
              {/* 1. Processing State */}
              {actionType === 'PROCESSING' && (
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  This will update the status to "Processing" so the agent knows you are working on it.
                </p>
              )}

              {/* 2. Success State (Upload) */}
              {actionType === 'COMPLETED' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <label className="block text-sm font-bold text-green-800 mb-2">Upload Result (PDF/Image)</label>
                    <input 
                      type="file" 
                      onChange={e => setResultFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-600 file:text-white hover:file:bg-green-700"
                    />
                  </div>
                  <textarea
                    placeholder="Optional Success Note (e.g. Tracking ID)"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-green-500 focus:border-green-500"
                    rows={2}
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                </div>
              )}

              {/* 3. Failed State (Refund Toggle) */}
              {actionType === 'FAILED' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-100">
                    <div>
                      <span className="text-sm font-bold text-red-800 block">Refund User?</span>
                      <span className="text-xs text-red-600">This reverses the wallet charge.</span>
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
                  <textarea
                    placeholder="Reason for rejection (Required)"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-red-500 focus:border-red-500 min-h-[100px]"
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={closeActionModal} 
                  className="flex-1 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isProcessing || isUploading || (actionType === 'FAILED' && !adminNote)}
                  className={`flex-1 py-2.5 text-sm font-bold text-white rounded-lg shadow-md transition-all
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
