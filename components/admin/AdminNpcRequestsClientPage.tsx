"use client";

import React, { useState } from 'react';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  DocumentArrowDownIcon, 
  UserIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  UsersIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { NpcRequest } from '@prisma/client';

// Helper to display data rows cleanly
const DataRow = ({ label, value }: { label: string, value: any }) => (
  <div className="border-b border-gray-100 py-3 last:border-0 group hover:bg-gray-50 transition-colors px-2 -mx-2 rounded">
    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="block text-sm font-semibold text-gray-900 mt-0.5 break-words">{value || '-'}</span>
  </div>
);

export default function NpcRequestDetail({ request }: { request: NpcRequest }) {
  const router = useRouter();
  
  // Admin Actions State
  const [action, setAction] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED'>('PROCESSING');
  const [note, setNote] = useState('');
  const [isRefund, setIsRefund] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Certificate Upload State
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certUrl, setCertUrl] = useState<string | null>(request.certificateUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const data = request.formData as any;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setCertFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('attestation', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCertUrl(json.url);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to update this request?")) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/npc/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          action,
          note,
          refund: isRefund,
          certificateUrl: certUrl
        }),
      });

      if (res.ok) {
        alert("Request updated successfully!");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">
      
      {/* --- LEFT COLUMN: ALL USER DATA (2/3 Width) --- */}
      <div className="xl:col-span-2 space-y-8">
        
        {/* 1. Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <h3 className="font-bold text-gray-800">Personal Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            <DataRow label="Surname" value={data.surname} />
            <DataRow label="First Name" value={data.firstName} />
            <DataRow label="Middle Name" value={data.middleName} />
            <DataRow label="Gender" value={data.sex} />
            <DataRow label="Date of Birth" value={data.dob} />
            <DataRow label="Marital Status" value={data.maritalStatus} />
            <DataRow label="State of Origin" value={data.stateOrigin} />
            <DataRow label="LGA of Origin" value={data.lgaOrigin} />
            <DataRow label="Town/Village" value={data.town} />
            <DataRow label="Place of Birth" value={data.birthPlace} />
            <DataRow label="State of Birth" value={data.birthState} />
            <DataRow label="LGA of Birth" value={data.birthLga} />
          </div>
        </div>

        {/* 2. Contact & Identity Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-2">
            <IdentificationIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-blue-900">Contact & Identity</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DataRow label="Phone Number" value={data.phone} />
            <DataRow label="Email Address" value={data.email} />
            <DataRow label="Mode of ID" value={data.idMode} />
            <DataRow label="ID Number" value={data.idNumber} />
          </div>
        </div>

        {/* 3. Registration Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center gap-2">
            <BriefcaseIcon className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-purple-900">Registration Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
            <DataRow label="Registration State" value={data.regState} />
            <DataRow label="Registration LGA" value={data.regLga} />
            <DataRow label="Nearest Center" value={data.regCenter} />
            <DataRow label="Residential Address" value={data.resAddress} />
            <DataRow label="Education Level" value={data.education} />
            <DataRow label="Occupation" value={data.occupation} />
            <DataRow label="Work Address" value={data.workAddress} />
            <div className="md:col-span-2 mt-2 pt-2 border-t border-gray-100">
                <DataRow label="Reason for Request" value={data.reason} />
            </div>
            <div className="md:col-span-2">
                <DataRow label="Requirement For" value={data.requirement} />
            </div>
            <div className="md:col-span-2">
                <DataRow label="Requesting Party Address" value={data.partyAddress} />
            </div>
          </div>
        </div>

        {/* 4. Parental Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-orange-600" />
            <h3 className="font-bold text-orange-900">Parental Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            
            {/* Father */}
            <div className="p-6 space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Father's Details</h4>
              <DataRow label="Surname" value={data.fatherSurname} />
              <DataRow label="First Name" value={data.fatherFirst} />
              <DataRow label="State of Origin" value={data.fatherState} />
              <DataRow label="LGA of Origin" value={data.fatherLga} />
              <DataRow label="Town/Village" value={data.fatherTown} />
            </div>

            {/* Mother */}
            <div className="p-6 space-y-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Mother's Details</h4>
              <DataRow label="Surname" value={data.motherSurname} />
              <DataRow label="First Name" value={data.motherFirst} />
              <DataRow label="Maiden Name" value={data.motherMaiden} />
              <DataRow label="State of Origin" value={data.motherState} />
              <DataRow label="LGA of Origin" value={data.motherLga} />
              <DataRow label="Town/Village" value={data.motherTown} />
            </div>
          </div>
        </div>

      </div>

      {/* --- RIGHT COLUMN: ACTIONS (1/3 Width) --- */}
      <div className="space-y-6">
        
        {/* Documents Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
             <DocumentArrowDownIcon className="h-5 w-5 text-gray-500"/> Uploaded Documents
          </h3>
          {request.affidavitUrl ? (
            <a 
              href={request.affidavitUrl} 
              target="_blank" 
              rel="noreferrer"
              className="block w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
            >
               View Affidavit
            </a>
          ) : (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
              No Affidavit Uploaded
            </div>
          )}
        </div>

        {/* Admin Processing Form */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 sticky top-6">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-lg text-gray-900">Process Request</h3>
             <span className={`px-3 py-1 rounded-full text-xs font-bold 
                ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                  request.status === 'FAILED' ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {request.status}
             </span>
          </div>
          
          <div className="space-y-5">
            
            {/* Action Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Update Status</label>
              <select 
                value={action} 
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              >
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed (Approve)</option>
                <option value="FAILED">Failed (Reject)</option>
              </select>
            </div>

            {/* Certificate Upload (Show only if Completed) */}
            {action === 'COMPLETED' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-green-800 mb-2">UPLOAD CERTIFICATE</label>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-green-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-green-200 file:text-green-800 hover:file:bg-green-300"
                />
                <div className="flex justify-between items-center mt-2 h-5">
                   {isUploading && <span className="text-xs text-green-600 flex items-center gap-1"><ArrowPathIcon className="h-3 w-3 animate-spin"/> Uploading...</span>}
                   {certUrl && <span className="text-xs font-bold text-green-700 flex items-center gap-1"><CheckCircleIcon className="h-3 w-3"/> Uploaded</span>}
                </div>
              </div>
            )}

            {/* Refund Option (Show only if Failed) */}
            {action === 'FAILED' && (
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-200 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="checkbox" 
                  id="refund" 
                  checked={isRefund} 
                  onChange={(e) => setIsRefund(e.target.checked)}
                  className="h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <label htmlFor="refund" className="text-sm text-red-900 font-medium cursor-pointer">Refund User Wallet?</label>
              </div>
            )}

            {/* Admin Note */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin Note / Remarks</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Enter reason for rejection or success message..."
                className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || isUploading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                   <ArrowPathIcon className="h-5 w-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" /> Confirm Update
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
