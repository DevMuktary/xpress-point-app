"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon, 
  EyeIcon, UserIcon, MapPinIcon, DocumentTextIcon, 
  BriefcaseIcon, AcademicCapIcon, UserGroupIcon
} from '@heroicons/react/24/outline';

type AdminRequest = {
  id: string;
  status: string;
  statusMessage: string | null;
  formData: any;
  affidavitUrl: string | null;
  certificateUrl: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminNpcRequestsClientPage({ initialRequests }: { initialRequests: any[] }) {
  
  const [requests, setRequests] = useState<AdminRequest[]>(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [viewReq, setViewReq] = useState<AdminRequest | null>(null);
  const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null); 
  const [actionType, setActionType] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Action Inputs
  const [adminNote, setAdminNote] = useState('');
  const [shouldRefund, setShouldRefund] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Helper Component for Data Display ---
  const DetailSection = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mb-4">
      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
        {children}
      </div>
    </div>
  );

  const DetailItem = ({ label, value }: { label: string, value: any }) => (
    <div className="col-span-1">
      <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">{label}</p>
      <p className="text-sm font-bold text-gray-800 mt-0.5 break-words">{value || '-'}</p>
    </div>
  );

  // --- Render Full Details ---
  const renderFullDetails = (req: AdminRequest) => {
    const d = req.formData;
    return (
      <div className="space-y-2 text-sm text-gray-700 bg-gray-50/50 p-4 rounded-lg">
        
        {/* 1. Documents Section */}
        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600"/>
              <div>
                <h4 className="font-bold text-indigo-900">Supporting Documents</h4>
                <p className="text-xs text-indigo-600">Affidavit & ID</p>
              </div>
           </div>
           {req.affidavitUrl ? (
              <a href={req.affidavitUrl} target="_blank" className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow hover:bg-indigo-700 transition-colors">
                 Download Affidavit
              </a>
           ) : <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">Missing</span>}
        </div>

        {/* 2. Personal Information */}
        <DetailSection title="Personal Information" icon={UserIcon}>
          <DetailItem label="Surname" value={d.surname} />
          <DetailItem label="First Name" value={d.firstName} />
          <DetailItem label="Middle Name" value={d.middleName} />
          <DetailItem label="Sex" value={d.sex} />
          <DetailItem label="Date of Birth" value={d.dob} />
          <DetailItem label="Marital Status" value={d.maritalStatus} />
          <DetailItem label="Email" value={d.email} />
          <DetailItem label="Phone Number" value={d.phone} />
          <DetailItem label="Mode of ID" value={d.idMode} />
          <DetailItem label="ID Number" value={d.idNumber} />
        </DetailSection>

        {/* 3. Origin & Birth Details */}
        <DetailSection title="Origin & Birth Details" icon={MapPinIcon}>
          <DetailItem label="State of Origin" value={d.stateOrigin} />
          <DetailItem label="LGA of Origin" value={d.lgaOrigin} />
          <DetailItem label="Town/Village" value={d.town} />
          <DetailItem label="Place of Birth" value={d.birthPlace} />
          <DetailItem label="State of Birth" value={d.birthState} />
          <DetailItem label="LGA of Birth" value={d.birthLga} />
        </DetailSection>

        {/* 4. Registration & Residence */}
        <DetailSection title="Registration & Residence" icon={DocumentTextIcon}>
          <DetailItem label="Reg. State" value={d.regState} />
          <DetailItem label="Reg. LGA" value={d.regLga} />
          <DetailItem label="Reg. Center" value={d.regCenter} />
          <div className="sm:col-span-3">
             <DetailItem label="Current Residential Address" value={d.resAddress} />
          </div>
        </DetailSection>

        {/* 5. Education & Occupation */}
        <DetailSection title="Education, Work & Request" icon={BriefcaseIcon}>
          <DetailItem label="Education Level" value={d.education} />
          <DetailItem label="Occupation" value={d.occupation} />
          <DetailItem label="Reason for Request" value={d.reason} />
          <div className="sm:col-span-3">
             <DetailItem label="Work Address" value={d.workAddress} />
          </div>
          <div className="sm:col-span-3 mt-2">
             <DetailItem label="Requesting Party Address" value={d.partyAddress} />
          </div>
          <div className="sm:col-span-3 mt-2">
             <DetailItem label="Requirement For" value={d.requirement} />
          </div>
        </DetailSection>

        {/* 6. Parents Details */}
        <DetailSection title="Parents Information" icon={UserGroupIcon}>
          {/* Father */}
          <div className="col-span-full mb-2 border-b border-dashed border-gray-200 pb-2">
            <p className="text-xs font-bold text-gray-500 mb-2">FATHER</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DetailItem label="Surname" value={d.fatherSurname} />
              <DetailItem label="First Name" value={d.fatherFirst} />
              <DetailItem label="State" value={d.fatherState} />
              <DetailItem label="LGA/Town" value={`${d.fatherLga || ''} ${d.fatherTown || ''}`} />
            </div>
          </div>
          {/* Mother */}
          <div className="col-span-full">
            <p className="text-xs font-bold text-gray-500 mb-2">MOTHER</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <DetailItem label="Surname" value={d.motherSurname} />
              <DetailItem label="First Name" value={d.motherFirst} />
              <DetailItem label="Maiden Name" value={d.motherMaiden} />
              <DetailItem label="State" value={d.motherState} />
              <DetailItem label="LGA/Town" value={`${d.motherLga || ''} ${d.motherTown || ''}`} />
            </div>
          </div>
        </DetailSection>

      </div>
    );
  };

  // --- Filtering Logic ---
  const filteredRequests = requests.filter(req => {
    const d = req.formData;
    const searchStr = `${req.user.firstName} ${req.user.lastName} ${d.surname} ${d.firstName}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase()) && (filterStatus === 'ALL' || req.status === filterStatus);
  });

  const openActionModal = (req: AdminRequest, action: 'PROCESSING' | 'COMPLETED' | 'FAILED') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNote('');
    setShouldRefund(false);
    setCertFile(null);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
  };

  const uploadCertificate = async (): Promise<string | null> => {
    if (!certFile) return null;
    const formData = new FormData();
    formData.append('attestation', certFile); 
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

    let certificateUrl = null;
    if (actionType === 'COMPLETED' && certFile) {
      setIsUploading(true);
      certificateUrl = await uploadCertificate();
      setIsUploading(false);
      if (!certificateUrl) {
          setIsProcessing(false);
          return; // Stop if upload failed
      }
    }

    try {
      const res = await fetch('/api/admin/npc/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedReq.id,
          action: actionType,
          refund: shouldRefund,
          note: adminNote,
          certificateUrl: certificateUrl
        })
      });

      if (!res.ok) throw new Error("Failed");

      // Optimistic update
      setRequests(prev => prev.map(r => r.id === selectedReq.id ? { 
          ...r, 
          status: actionType,
          certificateUrl: certificateUrl || r.certificateUrl 
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
             type="text" placeholder="Search Applicant Name..." 
             className="pl-10 w-full rounded-lg border-gray-300 p-2.5 text-sm"
             value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${filterStatus === s ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>{s}</button>
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
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Applicant</th>
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
                  <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                    {req.formData.surname} {req.formData.firstName}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                     <div className="flex justify-end items-center gap-2">
                       <button onClick={() => setViewReq(req)} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"><EyeIcon className="h-5 w-5"/></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             
             <div className="flex justify-between items-center border-b border-gray-200 p-5 bg-gray-50 rounded-t-2xl">
               <div>
                 <h3 className="text-xl font-bold text-gray-900">NPC Request Details</h3>
                 <p className="text-sm text-gray-500">Ref: {viewReq.id.slice(0,8)}</p>
               </div>
               <button onClick={() => setViewReq(null)} className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-all">
                 <XMarkIcon className="h-5 w-5 text-gray-500"/>
               </button>
             </div>

             <div className="p-6 overflow-y-auto">
               {renderFullDetails(viewReq)}
             </div>

             <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end">
               <button onClick={() => setViewReq(null)} className="px-6 py-2.5 bg-white border border-gray-300 font-bold text-gray-700 rounded-lg hover:bg-gray-100 shadow-sm">Close Viewer</button>
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
              
              {/* Certificate Upload for COMPLETED */}
              {actionType === 'COMPLETED' && (
                <div className="space-y-2 bg-green-50 p-3 rounded border border-green-100">
                  <label className="block text-xs font-bold text-green-800 uppercase">Upload Certificate (PDF/Image)</label>
                  <input 
                    type="file" 
                    onChange={e => setCertFile(e.target.files?.[0] || null)} 
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-green-200 file:text-green-800 hover:file:bg-green-300"
                  />
                </div>
              )}

              {/* Refund Option for FAILED */}
              {actionType === 'FAILED' && (
                 <div className="flex items-center justify-between bg-red-50 p-3 rounded-lg border border-red-100">
                    <span className="text-sm font-bold text-red-800">Refund User?</span>
                    <input type="checkbox" checked={shouldRefund} onChange={e => setShouldRefund(e.target.checked)} className="h-5 w-5 text-red-600"/>
                 </div>
              )}

              <textarea placeholder="Admin Note (Optional)..." className="w-full border rounded-lg p-2 text-sm min-h-[80px]" value={adminNote} onChange={e => setAdminNote(e.target.value)} />
              
              <div className="flex gap-3 pt-2">
                <button onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg">Cancel</button>
                <button onClick={handleSubmit} disabled={isProcessing || isUploading} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
