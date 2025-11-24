"use client"; 

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  IdentificationIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Type Definitions ---
type Props = {
  fee: number;
};

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "" }: {
  label: string, id: string, value: string, onChange: (value: string) => void, Icon: React.ElementType, type?: string, isRequired?: boolean, placeholder?: string
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired} placeholder={placeholder}
      />
    </div>
  </div>
);

// --- Reusable File Upload Component ---
const FileUpload = ({ label, id, file, onChange, fileUrl, isUploading, error }: {
  label: string, id: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, fileUrl: string | null, isUploading: boolean, error: string | null
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <input
        id={id}
        type="file"
        onChange={onChange}
        className="flex-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        accept="image/png, image/jpeg, application/pdf"
        required
      />
      {isUploading && <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-600" />}
      {fileUrl && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
    </div>
    {file && <p className="text-xs text-gray-500 mt-1">{file.name}</p>}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

// --- Notification Component ---
const NoticeBox = () => (
  <div className="mb-6 rounded-xl bg-blue-50 p-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-3">
      <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <span className="font-bold block mb-1">Processing Time</span>
        The service will be processed within 24-48 hours. We will verify with NIBSS and confirm receipt.
      </div>
    </div>
  </div>
);

// --- Consent Modal Component ---
const VninTermsModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          VNIN to NIBSS Terms
        </h2>
        <button onClick={onClose}>
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3 text-sm text-gray-700">
        <p>Kindly note that our work is only to send your VNIN slip to NIBSS, so please make sure everything is correct.</p>
        <p className="font-bold text-red-700">There is no refund for this service.</p>
        <p>The service will be processed within 24-48 hours. We will chat with Nora(NIBSS) and give you a confirmation that your VNIN was received by NIBSS.</p>
      </div>
      <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
        <Link
          href="/dashboard/services/bvn"
          className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
        >
          Go Back
        </Link>
        <button
          onClick={onClose}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  </div>
);


// --- The Main Component ---
export default function VninToNibssClientPage({ fee }: Props) {
  
  const serviceId = 'BVN_VNIN_TO_NIBSS';
  
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(true); 

  // --- Form Data State ---
  const [ticketId, setTicketId] = useState('');
  
  // --- File Upload State ---
  const [vninSlipFile, setVninSlipFile] = useState<File | null>(null);
  const [vninSlipUrl, setVninSlipUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setVninSlipFile(file);
    setIsUploading(true);
    setUploadError(null);
    setVninSlipUrl(null);

    try {
      const formData = new FormData();
      formData.append('attestation', file); 

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'File upload failed.');
      }
      setVninSlipUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message);
      setVninSlipFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setReceipt(null); 

    if (!vninSlipUrl) {
      setSubmitError("Please wait for the VNIN slip to finish uploading.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  // --- Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    const formData = { ticketId };

    try {
      const response = await fetch('/api/services/bvn/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceId, 
          formData, 
          vninSlipUrl: vninSlipUrl 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setReceipt({
        message: data.message,
        serviceName: "VNIN to NIBSS",
        status: "PENDING",
      });
      
      // Reset the form
      setTicketId('');
      setVninSlipFile(null); 
      setVninSlipUrl(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setReceipt(null);
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enter Request Details</h3>
          </div>
          
          {/* --- NOTIFICATION BLOCK --- */}
          <NoticeBox />
          {/* -------------------------- */}

          <div className="space-y-4">
            <DataInput 
              label="Ticket ID" 
              id="ticketId" 
              value={ticketId} 
              onChange={setTicketId} 
              Icon={IdentificationIcon} 
              isRequired={false} 
              placeholder="Enter Ticket ID (Optional)"
            />
            
            <FileUpload 
              label="Upload VNIN Slip*" 
              id="vnin-upload" 
              file={vninSlipFile} 
              fileUrl={vninSlipUrl} 
              isUploading={isUploading} 
              error={uploadError}
              onChange={handleFileUpload} 
            />
          </div>
          
          {/* --- Submit Button --- */}
          <div className="border-t border-gray-200 pt-6">
            {submitError && (
              <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || isUploading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
            >
              {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
            </button>
          </div>
        </form>
      </div>

      {/* --- Terms Modal --- */}
      {isTermsModalOpen && (
        <VninTermsModal onClose={() => setIsTermsModalOpen(false)} />
      )}

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600 text-sm leading-relaxed">
                Please confirm you have filled in the right details. This action is irreversible.
              </p>
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-center text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-center text-2xl font-bold text-blue-700">₦{fee}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0 border-t border-gray-200">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                YES, SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Success Modal (Receipt) --- */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Request Submitted
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {receipt.message}
                </p>
                
                <div className="w-full mt-6 space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Service:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="text-sm font-semibold text-yellow-600">{receipt.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">₦{fee}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <Link
                href="/dashboard/history/bvn"
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
              >
                Check History
              </Link>
              <button
                onClick={closeReceiptModal}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
