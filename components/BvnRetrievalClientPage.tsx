"use client"; 

import React, { useState, useMemo } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  IdentificationIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Type Definitions ---
type Props = {
  prices: { [key: string]: number }; 
};
type ServiceID = 'BVN_RETRIEVAL_PHONE' | 'BVN_RETRIEVAL_CRM';

// --- "Modern Button" Component ---
const ModTypeButton = ({ title, description, selected, onClick }: {
  title: string,
  description: string,
  selected: boolean,
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg p-4 text-left transition-all border-2
      ${selected
        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
        : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
  >
    <p className="font-semibold text-gray-900">{title}</p>
    <p className="text-sm text-blue-600 font-medium">{description}</p>
  </button>
);

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "", maxLength = 524288 }: {
  label: string,
  id: string,
  value: string,
  onChange: (value: string) => void,
  Icon: React.ElementType,
  type?: string,
  isRequired?: boolean,
  placeholder?: string,
  maxLength?: number
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  </div>
);

// --- Reusable File Upload Component ---
const FileUpload = ({ label, id, file, onChange, fileUrl, isUploading, error }: {
  label: string,
  id: string,
  file: File | null,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  fileUrl: string | null,
  isUploading: boolean,
  error: string | null
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <input
        id={id}
        type="file"
        onChange={onChange}
        className="flex-1 w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
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
        You will get the Result within 24 working hours.
      </div>
    </div>
  </div>
);

// --- The Main Component ---
export default function BvnRetrievalClientPage({ prices }: Props) {
  
  const [serviceId, setServiceId] = useState<ServiceID | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data State ---
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [agentCode, setAgentCode] = useState('');
  const [ticketId, setTicketId] = useState('');
  
  // --- File Upload State ---
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- Dynamic Fee ---
  const fee = useMemo(() => {
    if (serviceId === 'BVN_RETRIEVAL_PHONE') return prices.BVN_RETRIEVAL_PHONE || 0;
    if (serviceId === 'BVN_RETRIEVAL_CRM') return prices.BVN_RETRIEVAL_CRM || 0;
    return 0;
  }, [serviceId, prices]);

  // --- File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadFile(file);
    setIsUploading(true);
    setUploadError(null);
    setUploadUrl(null);

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
      setUploadUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message);
      setUploadFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!serviceId) {
      setSubmitError("Please select a retrieval type.");
      return;
    }
    if (serviceId === 'BVN_RETRIEVAL_CRM' && !uploadUrl) {
      setSubmitError("Please wait for the screenshot to finish uploading.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  // --- Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    let formData: any = {};
    if (serviceId === 'BVN_RETRIEVAL_PHONE') {
      formData = { phone, fullName };
    } else if (serviceId === 'BVN_RETRIEVAL_CRM') {
      formData = { agentCode, bmsTicket: ticketId, ticketId };
    }

    try {
      const response = await fetch('/api/services/bvn/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceId, 
          formData, 
          failedEnrollmentUrl: uploadUrl
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message);
      // Reset the form
      setServiceId(null);
      setPhone(''); setFullName(''); setAgentCode(''); setTicketId('');
      setUploadFile(null); setUploadUrl(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
      {/* --- Success Message --- */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-green-800">
              Request Submitted Successfully!
            </h3>
            <p className="text-sm text-green-700 mt-1">
              Your request is now <strong className="font-semibold">PENDING</strong>. You can monitor its status on the
              <Link href="/dashboard/history/bvn" className="font-semibold underline hover:text-green-600 ml-1">
                BVN History
              </Link> page.
            </p>
          </div>
        </div>
      )}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* --- NOTIFICATION BLOCK --- */}
        <NoticeBox />
        {/* -------------------------- */}

        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          {/* --- Service Type --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Retrieval Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ModTypeButton
                title="With Phone Number"
                description={`Fee: ₦${prices.BVN_RETRIEVAL_PHONE || 0}`}
                selected={serviceId === 'BVN_RETRIEVAL_PHONE'}
                onClick={() => setServiceId('BVN_RETRIEVAL_PHONE')}
              />
              <ModTypeButton
                title="With C.R.M"
                description={`Fee: ₦${prices.BVN_RETRIEVAL_CRM || 0}`}
                selected={serviceId === 'BVN_RETRIEVAL_CRM'}
                onClick={() => setServiceId('BVN_RETRIEVAL_CRM')}
              />
            </div>
          </div>

          {/* --- Conditional Form Fields --- */}
          {serviceId === 'BVN_RETRIEVAL_PHONE' && (
            <div className="border-t border-gray-200 pt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              <DataInput label="Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" maxLength={11} />
              <DataInput label="Full Name*" id="fullName" value={fullName} onChange={setFullName} Icon={UserIcon} />
            </div>
          )}
          
          {serviceId === 'BVN_RETRIEVAL_CRM' && (
            <div className="border-t border-gray-200 pt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              <DataInput label="Agent Code*" id="agentCode" value={agentCode} onChange={setAgentCode} Icon={IdentificationIcon} />
              <DataInput label="BMS Ticket / Ticket ID*" id="ticketId" value={ticketId} onChange={setTicketId} Icon={IdentificationIcon} />
              
              <FileUpload 
                label="Upload Screenshot of Failed Enrollment*" id="crm-upload" 
                file={uploadFile} fileUrl={uploadUrl} 
                isUploading={isUploading} error={uploadError}
                onChange={handleFileUpload} 
              />
            </div>
          )}
          
          {/* --- Submit Button --- */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6">
              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
              >
                {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
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
    </div>
  );
}
