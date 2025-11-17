"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  PhoneIcon,
  HomeIcon,
  CalendarDaysIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';

// --- Types ---
type Props = {
  hasAlreadyAgreed: boolean;
  prices: { [key: string]: number };
};
type ServiceID = 'NIN_MOD_NAME' | 'NIN_MOD_DOB' | 'NIN_MOD_PHONE' | 'NIN_MOD_ADDRESS';

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true }: {
  label: string, id: string, value: string, onChange: (value: string) => void, Icon: React.ElementType, type?: string, isRequired?: boolean
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired}
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

// --- Main Component ---
export default function NinModificationClientPage({ hasAlreadyAgreed, prices }: Props) {
  const [serviceId, setServiceId] = useState<ServiceID | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Consent Modal State
  const [hasAgreed, setHasAgreed] = useState(hasAlreadyAgreed);

  // Form Data State
  const [formData, setFormData] = useState({
    nin: '',
    oldName: '',
    newName: '',
    oldDob: '',
    newDob: '',
    oldPhone: '',
    newPhone: '',
    oldAddress: '',
    newAddress: '',
  });

  // Attestation (File Upload) State
  const [attestationFile, setAttestationFile] = useState<File | null>(null);
  const [attestationUrl, setAttestationUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Dynamic fee calculation
  const fee = useMemo(() => {
    if (!serviceId) return 0;
    // DOB +5 years fee logic
    if (serviceId === 'NIN_MOD_DOB' && formData.oldDob && formData.newDob) {
      try {
        const oldDate = new Date(formData.oldDob);
        const newDate = new Date(formData.newDob);
        const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        if (diffYears > 5) {
          return (prices['NIN_MOD_DOB'] || 0) + 2000;
        }
      } catch {}
    }
    return prices[serviceId] || 0;
  }, [serviceId, formData.oldDob, formData.newDob, prices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAttestationFile(file);
    setIsUploading(true);
    setUploadError(null);
    setAttestationUrl(null);

    try {
      const formData = new FormData();
      formData.append('attestation', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'File upload failed.');
      setAttestationUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message);
      setAttestationFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!attestationUrl) {
      setError("Please upload the attestation/affidavit before submitting.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/services/nin/modification-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          formData,
          attestationUrl,
          isDobGap: fee > (prices[serviceId!] || 0) // Check if extra fee was added
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed.');
      
      setSuccess(data.message);
      setServiceId(null);
      setFormData({ nin: '', oldName: '', newName: '', oldDob: '', newDob: '', oldPhone: '', newPhone: '', oldAddress: '', newAddress: '' });
      setAttestationFile(null);
      setAttestationUrl(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasAgreed) {
    // Show Consent Modal
    return (
      <ConsentModal onAgree={() => setHasAgreed(true)} />
    );
  }

  // Show Main Page
  return (
    <div className="space-y-6">
      {isLoading && <Loading />}
      
      {success && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-blue-800">Request Submitted!</h3>
              <p className="mt-2 text-sm text-blue-700">
                Your request is now <strong className="font-semibold">PENDING</strong>. 
                You can monitor its status on the <Link href="/dashboard/history/modification" className="font-semibold underline hover:text-blue-600">NIN Modification History</Link> page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          {/* 1. Select Service Type */}
          <div>
            <label className="text-lg font-semibold text-gray-900">1. Select Modification Type</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <ModTypeButton title="Name" description={`Fee: ₦${prices.NIN_MOD_NAME || 0}`} selected={serviceId === 'NIN_MOD_NAME'} onClick={() => setServiceId('NIN_MOD_NAME')} />
              <ModTypeButton title="Date of Birth" description={`Fee: ₦${prices.NIN_MOD_DOB || 0}+`} selected={serviceId === 'NIN_MOD_DOB'} onClick={() => setServiceId('NIN_MOD_DOB')} />
              <ModTypeButton title="Phone Number" description={`Fee: ₦${prices.NIN_MOD_PHONE || 0}`} selected={serviceId === 'NIN_MOD_PHONE'} onClick={() => setServiceId('NIN_MOD_PHONE')} />
              <ModTypeButton title="Address" description={`Fee: ₦${prices.NIN_MOD_ADDRESS || 0}`} selected={serviceId === 'NIN_MOD_ADDRESS'} onClick={() => setServiceId('NIN_MOD_ADDRESS')} />
            </div>
          </div>

          {/* 2. Show Form based on selection */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Details</h3>
              <DataInput label="NIN Number*" id="nin" value={formData.nin} onChange={handleInputChange} Icon={IdentificationIcon} />
              
              {serviceId === 'NIN_MOD_NAME' && (
                <>
                  <DataInput label="Old Full Name*" id="oldName" value={formData.oldName} onChange={handleInputChange} Icon={UserIcon} />
                  <DataInput label="New Full Name*" id="newName" value={formData.newName} onChange={handleInputChange} Icon={UserIcon} />
                </>
              )}
              {serviceId === 'NIN_MOD_DOB' && (
                <>
                  <DataInput label="Old Date of Birth*" id="oldDob" value={formData.oldDob} onChange={handleInputChange} Icon={CalendarDaysIcon} type="date" />
                  <DataInput label="New Date of Birth*" id="newDob" value={formData.newDob} onChange={handleInputChange} Icon={CalendarDaysIcon} type="date" />
                  {fee > prices.NIN_MOD_DOB && (
                    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                      <p className="text-sm font-bold text-yellow-800">Note: An additional ₦2000 fee applies for DOB changes over 5 years.</p>
                    </div>
                  )}
                </>
              )}
              {serviceId === 'NIN_MOD_PHONE' && (
                <>
                  <DataInput label="Old Phone Number*" id="oldPhone" value={formData.oldPhone} onChange={handleInputChange} Icon={PhoneIcon} type="tel" />
                  <DataInput label="New Phone Number*" id="newPhone" value={formData.newPhone} onChange={handleInputChange} Icon={PhoneIcon} type="tel" />
                </>
              )}
              {serviceId === 'NIN_MOD_ADDRESS' && (
                <>
                  <DataInput label="Old Address*" id="oldAddress" value={formData.oldAddress} onChange={handleInputChange} Icon={HomeIcon} />
                  <DataInput label="New Address*" id="newAddress" value={formData.newAddress} onChange={handleInputChange} Icon={HomeIcon} />
                </>
              )}

              <h3 className="text-lg font-semibold text-gray-900 pt-4">3. Upload Document</h3>
              <FileUpload 
                label="Attestation Letter / Court Affidavit*" 
                id="attestation" 
                file={attestationFile} 
                fileUrl={attestationUrl} 
                isUploading={isUploading} 
                error={uploadError}
                onChange={handleFileUpload} 
              />
            </div>
          )}

          {/* 3. Submit Button */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6">
              {error && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || isUploading || !attestationUrl}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">Please Confirm</h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                You are about to submit this modification request. This action is irreversible.
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{fee}
              </p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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

// --- Consent Modal Component ---
const ConsentModal = ({ onAgree }: { onAgree: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAgree = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/user/agree-to-terms', { method: 'POST' });
      onAgree();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            Modification Terms & Conditions
          </h2>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          <p className="font-semibold">Please read the following terms carefully before proceeding:</p>
          <p>1. Ensure your NIN slip is <span className="font-bold">valid and clear</span>. We are not responsible for errors from unclear slips.</p>
          <p>2. You must provide a <span className="font-bold">court affidavit</span> and a <span className="font-bold">valid attestation letter</span> for all modifications.</p>
          <p>3. <span className="font-bold text-red-700">NO REFUNDS</span> will be given if your request is rejected by NIMC due to incorrect documents, existing modifications, or any other issue from your end.</p>
          <p>4. This service is for <span className="font-bold">NAME, DOB, PHONE, and ADDRESS</span> modifications only.</p>
          <p>5. By clicking "I Agree", you confirm that you have read, understood, and agreed to these terms.</p>
        </div>
        <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
          <Link
            href="/dashboard/services/nin"
            className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
          >
            Go Back
          </Link>
          <button
            onClick={handleAgree}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "I Understand & Agree"}
          </button>
        </div>
      </div>
    </div>
  );
};
