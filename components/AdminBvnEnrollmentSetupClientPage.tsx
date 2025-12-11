"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  UserIcon,
  BuildingLibraryIcon,
  ArrowPathIcon // Added for Process icon
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
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
  // Added 'PROCESSING' to the action type
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | 'PROCESSING' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [agentCode, setAgentCode] = useState(''); 
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter
  const filteredRequests = requests.filter(req => {
    const d = req.formData;
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${d.agentLocation} ${d.agentBvn}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openActionModal = (req: AdminRequest, action: 'APPROVED' | 'REJECTED' | 'PROCESSING') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setAgentCode('');
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const handleSubmit = async () => {
    if (!selectedReq || !actionType) return;
    
    // Agent code is only required for APPROVAL
    if (actionType === 'APPROVED' && !agentCode) {
      alert("Please provide the Agent Code for approval.");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/admin/requests/process/bvn-enrollment-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          note: adminNote,
          agentCode: agentCode 
        })
      });

      if (!res.ok) throw new Error("Failed to process request");

      // Update local state based on action
      let newStatus = 'PENDING';
      if (actionType === 'APPROVED') newStatus = 'COMPLETED';
      if (actionType === 'REJECTED') newStatus = 'FAILED';
      if (actionType === 'PROCESSING') newStatus = 'PROCESSING';

      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { 
        ...r, 
        status: newStatus
      } : r));
      
      closeModal();
      alert(`Request marked as ${actionType}.`);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDetails = (req: AdminRequest) => {
    const d = req.formData;
    return (
      <div className="space-y-4 text-sm text-gray-700">
        
        {/* Agent Info */}
        <div className="bg-purple-50 p-3 rounded border border-purple-200">
           <p className="font-bold text-purple-900 mb-2 border-b border-purple-200 pb-1 flex items-center gap-2">
             <UserIcon className="h-4 w-4"/> Personal Info
           </p>
           <div className="grid grid-cols-2 gap-2">
             <p><strong>Name:</strong> {d.firstName} {d.lastName}</p>
             <p><strong>DOB:</strong> {d.dob}</p>
             <p><strong>Phone:</strong> {d.phone}</p>
             <p><strong>Email:</strong> {d.email}</p>
             <p className="col-span-2"><strong>Address:</strong> {d.address}, {d.lga}, {d.state} ({d.zone})</p>
           </div>
        </div>

        {/* Banking Info */}
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
           <p className="font-bold text-blue-900 mb-2 border-b border-blue-200 pb-1 flex items-center gap-2">
             <BuildingLibraryIcon className="h-4 w-4"/> Banking Info
           </p>
           <p><strong>Bank Name:</strong> {d.bankName}</p>
           <p><strong>Account Name:</strong> {d.accountName}</p>
           
           {/* Account Number Field */}
           <p className="mt-1 p-1 bg-white rounded border border-blue-100 inline-block">
             <strong>Account Number:</strong> <span className="font-mono text-lg font-bold">{d.bankAccountNumber || 'N/A'}</span>
           </p>
           
           <p className="mt-2"><strong>Agent BVN:</strong> {d.agentBvn}</p>
        </div>

        {/* Location Info */}
        <div className="p-3 border rounded bg-gray-50">
           <p className="font-bold text-gray-700 mb-1 flex items-center gap-2">
             <MapPinIcon className="h-4 w-4"/> Location
           </p>
           <p><strong>Agent Location:</strong> {d.agentLocation}</p>
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
             type="text" placeholder="Search by Name, Location, BVN..." 
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bank</th>
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
                  <td className="px-6 py-4 text-xs text-gray-600 max-w-[150px] truncate">{req.formData.agentLocation}</td>
                  <td className="px-6 py-4 text-xs text-gray-600">{req.formData.bankName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                     <div className="flex justify-end items-center gap-2">
                       <button onClick={() => setSelectedReq(req)} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-full"><EyeIcon className="h-5 w-5"/></button>
                       
                       {/* ACTIONS: Show if NOT Completed or Failed */}
                       {req.status !== 'COMPLETED' && req.status !== 'FAILED' && (
                         <div className="flex gap-1">
                           
                           {/* PROCESS BUTTON - Added Back */}
                           {req.status === 'PENDING' && (
                             <button onClick={() => openActionModal(req, 'PROCESSING')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100">Process</button>
                           )}

                           <button onClick={() => openActionModal(req, 'APPROVED')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded border border-green-200 hover:bg-green-100">Approve</button>
                           <button onClick={() => openActionModal(req, 'REJECTED')} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-200 hover:bg-red-100">Reject</button>
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

      {/* --- VIEW/ACTION MODAL --- */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center border-b border-gray-200 p-2 mb-4">
               <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
               <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6 text-gray-600"/></button>
             </div>
             
             {renderDetails(selectedReq)}

             {/* Action Section */}
             {actionType && (
               <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-xl">
                 <h4 className="font-bold text-gray-900 mb-3">
                   {actionType === 'APPROVED' ? 'Approve Request' : 
                    actionType === 'REJECTED' ? 'Reject Request' : 
                    'Mark as Processing'}
                 </h4>
                 
                 {actionType === 'APPROVED' && (
                   <div className="mb-3">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Agent Code</label>
                     <input 
                        type="text" 
                        value={agentCode} 
                        onChange={e => setAgentCode(e.target.value)} 
                        className="w-full border rounded-lg p-2 text-sm font-mono font-bold"
                        placeholder="e.g. AGT-12345"
                     />
                   </div>
                 )}

                 <div className="mb-3">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Note</label>
                   <textarea 
                      value={adminNote} 
                      onChange={e => setAdminNote(e.target.value)} 
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="Reason or instructions..."
                   />
                 </div>

                 <button 
                   onClick={handleSubmit} 
                   disabled={isProcessing}
                   className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all ${
                     actionType === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 
                     actionType === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' :
                     'bg-blue-600 hover:bg-blue-700'
                   }`}
                 >
                   {isProcessing ? 'Processing...' : `Confirm ${actionType}`}
                 </button>
               </div>
             )}

             {!actionType && (
               <div className="mt-6 flex justify-end">
                 <button onClick={closeModal} className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Close</button>
               </div>
             )}
          </div>
        </div>
      )}

    </div>
  );
}
