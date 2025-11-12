"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  MapPinIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

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

// --- "World-Class" Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "" }: {
  label: string,
  id: string,
  value: string,
  onChange: (value: string) => void,
  Icon: React.ElementType,
  type?: string,
  isRequired?: boolean,
  placeholder?: string
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired}
        placeholder={placeholder}
      />
    </div>
  </div>
);

// --- "World-Class" Reusable File Upload Component ---
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

// --- The Main "World-Class" Component ---
export default function TinClientPage() {
  
  // --- State Management ---
  const [serviceType, setServiceType] = useState<'REG' | 'RETRIEVAL' | null>(null);
  const [subType, setSubType] = useState<'PERSONAL' | 'BUSINESS' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data States ---
  // Personal Reg
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

  // Business Reg
  const [bizName, setBizName] = useState('');
  const [bizNumber, setBizNumber] = useState('');

  // Personal Retrieval
  const [tin, setTin] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  
  // Business Retrieval
  const [incorpDate, setIncorpDate] = useState('');

  // --- File Upload State ---
  const [statusReportFile, setStatusReportFile] = useState<File | null>(null);
  const [statusReportUrl, setStatusReportUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- "World-Class" File Upload Handler ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setStatusReportFile(file);
    setIsUploading(true);
    setUploadError(null);
    setStatusReportUrl(null);

    try {
      const formData = new FormData();
      formData.append('attestation', file); // Use the same 'attestation' key

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'File upload failed.');
      }
      setStatusReportUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message);
      setStatusReportFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- "World-Class" Dynamic Pricing & Service ID ---
  const { serviceId, fee } = useMemo(() => {
    if (serviceType === 'REG' && subType === 'PERSONAL') {
      return { serviceId: 'TIN_REG_PERSONAL', fee: 3000 };
    }
    if (serviceType === 'REG' && subType === 'BUSINESS') {
      return { serviceId: 'TIN_REG_BUSINESS', fee: 5000 };
    }
    if (serviceType === 'RETRIEVAL' && subType === 'PERSONAL') {
      return { serviceId: 'TIN_RETRIEVAL_PERSONAL', fee: 1500 };
    }
    if (serviceType === 'RETRIEVAL' && subType === 'BUSINESS') {
      return { serviceId: 'TIN_RETRIEVAL_BUSINESS', fee: 2500 };
    }
    return { serviceId: null, fee: 0 };
  }, [serviceType, subType]);

  // --- Reset Sub-forms when main type changes ---
  const handleServiceTypeChange = (type: 'REG' | 'RETRIEVAL') => {
    setServiceType(type);
    setSubType(null); // Reset sub-type
  };

  // --- Handle Open Confirmation Modal ---
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
  
  // --- This is the *final* submit, called by the modal's "YES" button ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    
    let formData: any = {};

    if (serviceType === 'REG' && subType === 'PERSONAL') {
      formData = { bvn, nin, email, phone, firstName, lastName, middleName, address, state, lga };
    } else if (serviceType === 'REG' && subType === 'BUSINESS') {
      formData = { bizName, bizNumber };
    } else if (serviceType === 'RETRIEVAL' && subType === 'PERSONAL') {
      formData = { bvnOrNin: bvn, fullName, dob }; // Re-use BVN state for "BVN or TIN"
    } else if (serviceType === 'RETRIEVAL' && subType === 'BUSINESS') {
      formData = { bizName, bizNumber, incorpDate }; // Re-use Business Reg states
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
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message);
      // Reset the form
      setServiceType(null); setSubType(null);
      setBvn(''); setNin(''); setEmail(''); setPhone(''); setFirstName(''); setLastName(''); setMiddleName(''); setAddress(''); setState(''); setLga('');
      setBizName(''); setBizNumber('');
      setTin(''); setFullName(''); setDob(''); setIncorpDate('');
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
      
      {/* --- Your "Sweet Alert" Style Message --- */}
      {success && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-blue-800">
                Request Submitted Successfully!
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Your request is now <strong className="font-semibold">PENDING</strong>. You can monitor its status on the
                  <Link href="/dashboard/history/tin" className="font-semibold underline hover:text-blue-600">
                    JTB-TIN History
                  </Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          {/* --- "Modern Buttons" for Main Service Type --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Service Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* --- "Modern Buttons" for Sub-Type --- */}
          {serviceType && (
            <div className="border-t border-gray-200 pt-6">
              <label className="text-lg font-semibold text-gray-900">
                2. Select Sub-Type
              </label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <ModTypeButton
                  title="Personal"
                  description={serviceType === 'REG' ? "Fee: ₦3000" : "Fee: ₦1500"}
                  selected={subType === 'PERSONAL'}
                  onClick={() => setSubType('PERSONAL')}
                />
                <ModTypeButton
                  title="Business"
                  description={serviceType === 'REG' ? "Fee: ₦5000" : "Fee: ₦2500"}
                  selected={subType === 'BUSINESS'}
                  onClick={() => setSubType('BUSINESS')}
                />
              </div>
            </div>
          )}

          {/* --- Conditional Form Fields --- */}
          {subType && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">3. Enter Required Details</h3>
              
              {/* === REGISTRATION - PERSONAL === */}
              {serviceType === 'REG' && subType === 'PERSONAL' && (
                <div className="space-y-4">
                  <DataInput label="BVN Number*" id="bvn" value={bvn} onChange={setBvn} Icon={IdentificationIcon} type="tel" />
                  <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} type="tel" />
                  <DataInput label="Email*" id="email" value={email} onChange={setEmail} Icon={EnvelopeIcon} type="email" />
                  <DataInput label="Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" />
                  <DataInput label="First Name*" id="fname" value={firstName} onChange={setFirstName} Icon={UserIcon} />
                  <DataInput label="Last Name*" id="lname" value={lastName} onChange={setLastName} Icon={UserIcon} />
                  <DataInput label="Middle Name (Optional)" id="mname" value={middleName} onChange={setMiddleName} Icon={UserIcon} isRequired={false} />
                  <DataInput label="Full Address*" id="address" value={address} onChange={setAddress} Icon={HomeIcon} />
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
                    onChange={(e) => { 
                      if(e.target.files) {
                        setStatusReportFile(e.target.files[0]); 
                        handleFileUpload(e.target.files[0], setIsUploading, setStatusReportUrl, setUploadError);
                      }
                    }} 
                  />
                </div>
              )}

              {/* === RETRIEVAL - PERSONAL === */}
              {serviceType === 'RETRIEVAL' && subType === 'PERSONAL' && (
                <div className="space-y-4">
                  <DataInput label="BVN Number or TIN Number*" id="bvnOrNin" value={bvn} onChange={setBvn} Icon={IdentificationIcon} />
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
          
          {/* --- Attestation & Submit Button --- */}
          {subType && (
            <div className="border-t border-gray-200 pt-6 space-y-6">
              <p className="text-sm font-medium text-red-600 text-center">
                Please confirm you have filled in the right details, this action is irreversible.
              </p>

              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- Your "World-Class" Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">
                Please confirm you have filled in the right details. This action is irreversible.
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
