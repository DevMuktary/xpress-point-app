"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XCircleIcon, 
  CheckCircleIcon, 
  UserIcon, 
  MapPinIcon,
  BuildingLibraryIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  formData: any;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminBvnEnrollmentSetupClientPage({ initialRequests }: { initialRequests: AdminRequest[] }) {
  
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null); // For Action
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null); // For View Details
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);

  const filteredRequests = requests.filter(req => {
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${req.user.email}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const handleSubmit = async () => {
    if (!selectedReq || !actionType) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/requests/process/bvn-enrollment-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote
        })
      });

      if (!res.ok) throw new Error("Failed");

      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { ...r, status: actionType } : r));
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

  // --- Render Full Details ---
  const renderFullDetails = (req: AdminRequest) => {
    const d = req.formData;
    return (
      <div className="space-y-4 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
        
        {/* Agent Profile */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Personal Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-gray-400">First Name</span>
              <span className="font-semibold text-gray-900">{d.firstName}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400">Last Name</span>
              <span className="font-semibold text-gray-900">{d.lastName}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400">Date of Birth</span>
              <span className="font-medium flex items-center gap-1">
                 <CalendarDaysIcon className="h-3 w-3 text-gray-400"/> {d.dob}
              </span>
            </div>
          </div>
        </div>

        {/* Banking Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-xs font-bold text-blue-500 uppercase mb-3 flex items-center gap-2">
            <BuildingLibraryIcon className="h-4 w-4" /> Banking & Agent Details
          </h4>
          <div className="space-y-2">
            <div>
               <span className="block text-xs text-blue-400">Agent Location</span>
               <span className="font-bold text-gray-900 flex items-center gap-1">
                 <MapPinIcon className="h-3 w-3"/> {d.agentLocation}
               </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-blue-400">Agent BVN</span>
                <span className="font-mono font-bold text-gray-900">{d.agentBvn}</span>
              </div>
               <div>
                <span className="block text-xs text-blue-400">Bank Name</span>
                <span className="font-semibold text-gray-900">{d.bankName}</span>
              </div>
            </div>
            <div>
               <span className="block text-xs text-blue-400">Account Name</span>
               <span className="font-medium text-gray-900">{d.accountName}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border p-4 rounded-lg">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Contact Details</h4>
          <div className="grid grid-cols-1 gap-3">
             <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4 text-gray-400"/>
                <span>{d.email}</span>
                {d.altEmail && <span className="text-gray-400 text-xs">({d.altEmail})</span>}
             </div>
             <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-gray-400"/>
                <span>{d.phone}</span>
                {d.altPhone && <span className="text-gray-400 text-xs">({d.altPhone})</span>}
             </div>
          </div>
        </div>

        {/* Address */}
        <div className="border p-4 rounded-lg">
          <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Residential Address</h4>
          <p>{d.address}</p>
          <p className="text-xs text-gray-500 mt-1">{d.lga}, {d.state} ({d.zone})</p>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">{req.formData.firstName} {req.formData.lastName}</div>
                    <div className="text-xs text-gray-500">{req.formData.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600">
                    {req.formData.lga}, {req.formData.state}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                     <div className="flex justify-end items-center gap-2">
                       
                       {/* View Button */}
                       <button 
                         onClick={() => setViewReq(req)} 
                         className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                         title="View Full Details"
                       >
                         <EyeIcon className="h-5 w-5"/>
                       </button>

                       {/* Actions */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative my-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center border-b border-gray-200 p-5">
               <h3 className="text-lg font-bold text-gray-900">Enrollment Request Details</h3>
               <button onClick={() => setViewReq(null)} className="p-1 rounded-full hover:bg-gray-100">
                 <XMarkIcon className="h-6 w-6 text-gray-500"/>
               </button>
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
              {actionType === 'COMPLETED' && (
                 <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
                   This confirms the agent setup is done. They will receive credentials via email.
                 </p>
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
                <button onClick={handleSubmit} disabled={isProcessing} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">{isProcessing ? 'Saving...' : 'Confirm'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


