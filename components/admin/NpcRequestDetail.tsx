"use client";

import React, { useState } from 'react';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, DocumentArrowDownIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { NpcRequest } from '@prisma/client';

// Helper to display data rows
const DataRow = ({ label, value }: { label: string, value: any }) => (
  <div className="border-b border-gray-100 py-3 last:border-0">
    <span className="block text-xs font-medium text-gray-500 uppercase">{label}</span>
    <span className="block text-sm font-semibold text-gray-900 mt-1">{value || '-'}</span>
  </div>
);

export default function NpcRequestDetail({ request }: { request: NpcRequest }) {
  const router = useRouter();
  const [action, setAction] = useState<'PROCESSING' | 'COMPLETED' | 'FAILED'>('PROCESSING');
  const [note, setNote] = useState('');
  const [isRefund, setIsRefund] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Admin Upload State
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* --- LEFT COLUMN: DATA DISPLAY --- */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <DataRow label="Surname" value={data.surname} />
            <DataRow label="First Name" value={data.firstName} />
            <DataRow label="Middle Name" value={data.middleName} />
            <DataRow label="Sex" value={data.sex} />
            <DataRow label="Date of Birth" value={data.dob} />
            <DataRow label="Marital Status" value={data.maritalStatus} />
            <DataRow label="Phone" value={data.phone} />
            <DataRow label="Email" value={data.email} />
            <DataRow label="State of Origin" value={data.stateOrigin} />
            <DataRow label="LGA of Origin" value={data.lgaOrigin} />
            <DataRow label="Town/Village" value={data.town} />
            <DataRow label="Mode of ID" value={data.idMode} />
            <DataRow label="ID Number" value={data.idNumber} />
            <DataRow label="Birth Place" value={data.birthPlace} />
            <DataRow label="Birth State" value={data.birthState} />
            <DataRow label="Birth LGA" value={data.birthLga} />
          </div>
        </div>

        {/* Registration Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Registration Details</h3>
          <div className="grid grid-cols-1 gap-4">
            <DataRow label="Reg State" value={data.regState} />
            <DataRow label="Reg LGA" value={data.regLga} />
            <DataRow label="Reg Center" value={data.regCenter} />
            <DataRow label="Residential Address" value={data.resAddress} />
            <DataRow label="Education" value={data.education} />
            <DataRow label="Occupation" value={data.occupation} />
            <DataRow label="Work Address" value={data.workAddress} />
            <DataRow label="Reason" value={data.reason} />
            <DataRow label="Requirement For" value={data.requirement} />
            <DataRow label="Requesting Party Address" value={data.partyAddress} />
          </div>
        </div>

        {/* Parent Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Parent Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">Father</h4>
              <DataRow label="Surname" value={data.fatherSurname} />
              <DataRow label="First Name" value={data.fatherFirst} />
              <DataRow label="State" value={data.fatherState} />
              <DataRow label="LGA" value={data.fatherLga} />
              <DataRow label="Town" value={data.fatherTown} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-700 mb-2">Mother</h4>
              <DataRow label="Surname" value={data.motherSurname} />
              <DataRow label="First Name" value={data.motherFirst} />
              <DataRow label="Maiden Name" value={data.motherMaiden} />
              <DataRow label="State" value={data.motherState} />
              <DataRow label="LGA" value={data.motherLga} />
              <DataRow label="Town" value={data.motherTown} />
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: ACTIONS --- */}
      <div className="space-y-6">
        
        {/* User's Affidavit Download */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">User Documents</h3>
          {request.affidavitUrl ? (
            <a 
              href={request.affidavitUrl} 
              target="_blank" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5" /> Download Affidavit
            </a>
          ) : (
            <p className="text-red-500 text-sm">No Affidavit Uploaded</p>
          )}
        </div>

        {/* Admin Action Form */}
        <div className="bg-white rounded-xl shadow p-6 border-t-4 border-blue-600">
          <h3 className="font-bold text-gray-900 mb-6">Process Request</h3>
          
          <div className="space-y-4">
            {/* Status Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Set Status</label>
              <select 
                value={action} 
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed (Approve)</option>
                <option value="FAILED">Failed (Reject)</option>
              </select>
            </div>

            {/* Conditional: Upload Certificate */}
            {action === 'COMPLETED' && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <label className="block text-xs font-bold text-green-800 mb-1">Upload Final Certificate</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-green-700 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-200 file:text-green-800 hover:file:bg-green-300"
                  />
                  {isUploading && <ArrowPathIcon className="h-4 w-4 animate-spin text-green-600" />}
                </div>
                {certUrl && <p className="text-xs text-green-600 mt-1 truncate">Uploaded: {certUrl}</p>}
              </div>
            )}

            {/* Conditional: Refund */}
            {action === 'FAILED' && (
              <div className="flex items-center gap-2 bg-red-50 p-3 rounded-lg border border-red-100">
                <input 
                  type="checkbox" 
                  id="refund" 
                  checked={isRefund} 
                  onChange={(e) => setIsRefund(e.target.checked)}
                  className="h-4 w-4 text-red-600 rounded border-gray-300"
                />
                <label htmlFor="refund" className="text-sm text-red-800 font-medium">Refund User?</label>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Reason for rejection or success message..."
                className="w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || isUploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" /> Update Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
