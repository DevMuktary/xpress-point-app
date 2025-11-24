"use client"; 

import React, { useState, useMemo } from 'react';
import { 
  CheckCircleIcon,
  UserIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  MapPinIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Props Definition ---
type Props = {
  prices: Record<string, number>; 
};

// --- Helper Components ---
const ModTypeButton = ({ title, description, selected, onClick }: {
  title: string, description: string, selected: boolean, onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg p-4 text-left transition-all border-2 w-full
      ${selected
        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
        : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
  >
    <p className="font-semibold text-gray-900">{title}</p>
    <p className="text-sm text-blue-600 font-medium">{description}</p>
  </button>
);

const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "" }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} type={type} value={value} required={isRequired} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
);

const FileUpload = ({ label, id, file, onChange, fileUrl, isUploading, error }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <input
        id={id} type="file" onChange={onChange} accept="image/png, image/jpeg, application/pdf" required
        className="flex-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
        You will get the Certificate within 48 to 72 working Hours.
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function TinClientPage({ prices }: Props) {
  
  // --- State Management ---
  const [serviceType, setServiceType] = useState<'REG' | 'RETRIEVAL' | null>(null);
  const [subType, setSubType] = useState<'PERSONAL' | 'BUSINESS' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data States ---
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [bizName, setBizName] = useState('');
  const [bizNumber, setBizNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [incorpDate, setIncorpDate] = useState('');

  // --- File Upload State ---
  const [statusReportFile, setStatusReportFile] = useState<File | null>(null);
  const [statusReportUrl, setStatusReportUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- Dynamic Fee Calculation ---
  const { serviceId, fee } = useMemo(() => {
    let id = '';
    if (serviceType === 'REG' && subType === 'PERSONAL') id = 'TIN_REG_PERSONAL';
    else if (serviceType === 'REG' && subType === 'BUSINESS') id = 'TIN_REG_BUSINESS';
    else if (serviceType === 'RETRIEVAL' && subType === 'PERSONAL') id = 'TIN_RETRIEVAL_PERSONAL';
    else if (serviceType === 'RETRIEVAL' && subType === 'BUSINESS') id = 'TIN_RETRIEVAL_BUSINESS';
    
    return { serviceId: id, fee: prices[id] || 0 };
  }, [serviceType, subType, prices]);

  // --- Reset Sub-forms ---
  const handleServiceTypeChange = (type: 'REG' | 'RETRIEVAL') => {
    setServiceType(type);
    setSubType(null); 
  };

  // --- File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setStatusReportFile(file);
    setIsUploading(true);
    setUploadError(null);
    setStatusReportUrl(null);

    try {
      const formData = new FormData();
      formData.append('attestation', file); 
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatusReportUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message);
      setStatusReportFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Step 1: Open Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!serviceId) {
      setSubmitError("Please select a service type and sub-type.");
      return;
    }
    if (serviceType === 'REG' && subType === 'BUSINESS' && !statusReportUrl) {
      setSubmitError("Please wait for the Status Report to finish uploading.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  // --- Step 2: Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    
    let formData: any = {};

    if (serviceType === 'REG' && subType === 'PERSONAL') {
      formData = { bvn, nin, email, phone, firstName, lastName, middleName, address, state, lga };
    } else if (serviceType === 'REG' && subType === 'BUSINESS') {
      formData = { bizName, bizNumber };
    } else if (serviceType === 'RETRIEVAL' && subType === 'PERSONAL') {
      formData = { bvnOrNin: bvn, fullName, dob }; 
    } else if (serviceType === 'RETRIEVAL' && subType === 'BUSINESS') {
      formData = { bizName, bizNumber, incorpDate };
    }

    try {
      const response = await fetch('/api/services/tin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          formData, 
          statusReportUrl: statusReportUrl || null
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      window.scrollTo(0, 0);

      // Reset Form
      setServiceType(null); setSubType(null);
      setBvn(''); setNin(''); setEmail(''); setPhone(''); setFirstName(''); setLastName(''); setMiddleName(''); setAddress(''); setState(''); setLga('');
      setBizName(''); setBizNumber(''); setFullName(''); setDob(''); setIncorpDate('');
      setStatusReportFile(null); setStatusReportUrl(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}
      
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-green-800">Success!</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
            <Link href="/dashboard/history/tin" className="text-sm font-semibold underline text-green-800 mt-2 block">
              View History
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* --- NOTIFICATION BLOCK (Visible always) --- */}
        <NoticeBox />
        {/* -------------------------- */}

        <form onSubmit={handleOpenConfirmModal} className="space-y-8">
          
          {/* 1. Service Type */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. Select Service Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModTypeButton
                title="JTB-TIN Registration"
                description="Register a new TIN"
                selected={serviceType === 'REG'}
                onClick={() => handleServiceTypeChange('REG')}
              />
              <ModTypeButton
                title="JTB-TIN Retrieval"
                description="Retrieve existing certificate"
                selected={serviceType === 'RETRIEVAL'}
                onClick={() => handleServiceTypeChange('RETRIEVAL')}
              />
            </div>
          </div>

          {/* 2. Sub-Type */}
          {serviceType && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-4">2. Select Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ModTypeButton
                  title="Personal"
                  description={`Fee: ₦${prices[`TIN_${serviceType}_PERSONAL`]?.toLocaleString() || '...'}`}
                  selected={subType === 'PERSONAL'}
                  onClick={() => setSubType('PERSONAL')}
                />
                <ModTypeButton
                  title="Business"
                  description={`Fee: ₦${prices[`TIN_${serviceType}_BUSINESS`]?.toLocaleString() || '...'}`}
                  selected={subType === 'BUSINESS'}
                  onClick={() => setSubType('BUSINESS')}
                />
              </div>
            </div>
          )}

          {/* 3. Conditional Fields */}
          {subType && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-gray-100 pt-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">3. Enter Details</h3>
              
              {/* === REGISTRATION - PERSONAL === */}
              {serviceType === 'REG' && subType === 'PERSONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataInput label="BVN Number*" id="bvn" value={bvn} onChange={setBvn} Icon={IdentificationIcon} type="tel" />
                  <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} type="tel" />
                  <DataInput label="Email*" id="email" value={email} onChange={setEmail} Icon={EnvelopeIcon} type="email" />
                  <DataInput label="Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" />
                  <DataInput label="First Name*" id="fname" value={firstName} onChange={setFirstName} Icon={UserIcon} />
                  <DataInput label="Last Name*" id="lname" value={lastName} onChange={setLastName} Icon={UserIcon} />
                  <DataInput label="Middle Name" id="mname" value={middleName} onChange={setMiddleName} Icon={UserIcon} isRequired={false} />
                  <div className="md:col-span-2">
                    <DataInput label="Full Address*" id="address" value={address} onChange={setAddress} Icon={HomeIcon} />
                  </div>
                  <DataInput label="State*" id="state" value={state} onChange={setState} Icon={MapPinIcon} />
                  <DataInput label="LGA*" id="lga" value={lga} onChange={setLga} Icon={MapPinIcon} />
                </div>
              )}

              {/* === REGISTRATION - BUSINESS === */}
              {serviceType === 'REG' && subType === 'BUSINESS' && (
                <div className="space-y-4">
                  <DataInput label="Business Name*" id="bizName" value={bizName} onChange={setBizName} Icon={BriefcaseIcon} />
                  <DataInput label="BN/RC Number*" id="bizNumber" value={bizNumber} onChange={setBizNumber} Icon={BuildingOfficeIcon} />
                  <FileUpload 
                    label="Upload Status Report*" id="statusReport" 
                    file={statusReportFile} fileUrl={statusReportUrl} 
                    isUploading={isUploading} error={uploadError}
                    onChange={handleFileUpload} 
                  />
                </div>
              )}

              {/* === RETRIEVAL - PERSONAL === */}
              {serviceType === 'RETRIEVAL' && subType === 'PERSONAL' && (
                <div className="space-y-4">
                  <DataInput label="BVN or TIN Number*" id="bvnOrNin" value={bvn} onChange={setBvn} Icon={IdentificationIcon} />
                  <DataInput label="Full Name*" id="fullName" value={fullName} onChange={setFullName} Icon={UserIcon} />
                  <DataInput label="Date of Birth*" id="dob" value={dob} onChange={setDob} Icon={CalendarDaysIcon} type="date" />
                </div>
              )}

              {/* === RETRIEVAL - BUSINESS === */}
              {serviceType === 'RETRIEVAL' && subType === 'BUSINESS' && (
                <div className="space-y-4">
                  <DataInput label="Business Name*" id="bizName" value={bizName} onChange={setBizName} Icon={BriefcaseIcon} />
                  <DataInput label="CAC BN/RC Number*" id="bizNumber" value={bizNumber} onChange={setBizNumber} Icon={BuildingOfficeIcon} />
                  <DataInput label="Date of Incorporation*" id="incorpDate" value={incorpDate} onChange={setIncorpDate} Icon={CalendarDaysIcon} type="date" />
                </div>
              )}
            </div>
          )}
          
          {/* 4. Submit Button */}
          {subType && (
            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-red-600 text-center mb-4 bg-red-50 p-2 rounded">
                Please confirm details are correct. This action is irreversible.
              </p>

              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : `Submit Request (₦${fee.toLocaleString()})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Submission</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Please verify all details.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-2xl font-bold text-blue-700">₦{fee.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-100">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                className="p-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
