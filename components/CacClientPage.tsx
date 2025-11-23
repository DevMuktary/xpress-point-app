"use client";

import React, { useState } from 'react';
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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Props Definition ---
type Props = {
  prices: Record<string, number>; // Received from server
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

// --- MAIN COMPONENT ---
export default function CacClientPage({ prices }: Props) {
  
  // --- UI State ---
  const [serviceType, setServiceType] = useState<'REG_BN' | 'DOC_RETRIEVAL' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasAttested, setHasAttested] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Registration Fields ---
  const [bizName1, setBizName1] = useState('');
  const [bizName2, setBizName2] = useState('');
  const [bizNature, setBizNature] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizState, setBizState] = useState('');
  const [bizLga, setBizLga] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  
  // --- Retrieval Fields ---
  const [docType, setDocType] = useState<'Certificate' | 'Status Report' | null>(null);
  const [fullBizName, setFullBizName] = useState(''); // Specific to retrieval
  const [bizNumber, setBizNumber] = useState('');     // Specific to retrieval

  // --- Proprietor Fields (Shared) ---
  const [propFirstName, setPropFirstName] = useState('');
  const [propLastName, setPropLastName] = useState('');
  const [propMiddleName, setPropMiddleName] = useState('');
  const [propNin, setPropNin] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propPhone, setPropPhone] = useState('');
  const [propEmail, setPropEmail] = useState('');
  const [propState, setPropState] = useState('');
  const [propLga, setPropLga] = useState('');

  // --- File Uploads ---
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);

  const [ninSlipFile, setNinSlipFile] = useState<File | null>(null);
  const [ninSlipUrl, setNinSlipUrl] = useState<string | null>(null);
  const [isUploadingNinSlip, setIsUploadingNinSlip] = useState(false);

  // --- Get Current Fee ---
  const getFee = () => {
    if (serviceType === 'REG_BN') return prices['CAC_REG_BN'] || 0;
    if (serviceType === 'DOC_RETRIEVAL') return prices['CAC_DOC_RETRIEVAL'] || 0;
    return 0;
  };

  // --- File Upload Logic ---
  const handleFileUpload = async (file: File, setUploading: any, setUrl: any) => {
    setUploading(true);
    setUrl(null);
    try {
      const formData = new FormData();
      formData.append('attestation', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUrl(data.url);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- Step 1: Validation & Open Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!serviceType) {
      setSubmitError("Please select a service type.");
      return;
    }
    if (!hasAttested) {
      setSubmitError("You must agree to the attestation.");
      return;
    }

    // Specific Validation
    if (serviceType === 'REG_BN') {
      if (!passportUrl || !signatureUrl || !ninSlipUrl) {
        setSubmitError("Please wait for all file uploads to complete.");
        return;
      }
    }
    if (serviceType === 'DOC_RETRIEVAL') {
      if (!docType) {
        setSubmitError("Please select a document type.");
        return;
      }
    }
    
    setIsConfirmModalOpen(true);
  };

  // --- Step 2: Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    
    let serviceId = '';
    let formData: any = {};
    let attestationUrls: any = {};

    if (serviceType === 'REG_BN') {
      serviceId = 'CAC_REG_BN';
      formData = { 
        bizName1, bizName2, bizNature, bizAddress, bizState, bizLga, bizPhone, bizEmail,
        propFirstName, propLastName, propMiddleName, propNin, propAddress, propPhone, propEmail, propState, propLga
      };
      attestationUrls = { passportUrl, signatureUrl, ninSlipUrl };
    } else if (serviceType === 'DOC_RETRIEVAL') {
      serviceId = 'CAC_DOC_RETRIEVAL';
      // Correct fields for retrieval
      formData = {
        docType, 
        fullBizName, 
        bizNumber, 
        proprietorName: `${propFirstName} ${propLastName}`, // Concatenate for retrieval summary
        proprietorPhone: propPhone,
        proprietorEmail: propEmail
      };
    }

    try {
      const response = await fetch('/api/services/cac/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, formData, ...attestationUrls }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      window.scrollTo(0, 0);
      
      // Cleanup State
      setServiceType(null); 
      setHasAttested(false);
      // ... (You can clear other fields here if desired)

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isSubmitting && <Loading />}

      {/* Success Banner */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-green-800">Success!</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
            <Link href="/dashboard/history/cac" className="text-sm font-semibold underline text-green-800 mt-2 block">
              View History
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleOpenConfirmModal} className="space-y-8">
          
          {/* 1. Service Selection */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">1. Select Service Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModTypeButton
                title="Business Name Registration"
                description={`Fee: ₦${prices['CAC_REG_BN']?.toLocaleString() || '...'}`}
                selected={serviceType === 'REG_BN'}
                onClick={() => setServiceType('REG_BN')}
              />
              <ModTypeButton
                title="Document Retrieval"
                description={`Fee: ₦${prices['CAC_DOC_RETRIEVAL']?.toLocaleString() || '...'}`}
                selected={serviceType === 'DOC_RETRIEVAL'}
                onClick={() => setServiceType('DOC_RETRIEVAL')}
              />
            </div>
          </div>

          {/* 2. Dynamic Forms */}
          {serviceType === 'REG_BN' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataInput label="Proposed Name 1*" id="bname1" value={bizName1} onChange={setBizName1} Icon={BriefcaseIcon} />
                  <DataInput label="Proposed Name 2*" id="bname2" value={bizName2} onChange={setBizName2} Icon={BriefcaseIcon} />
                  <div className="md:col-span-2">
                    <DataInput label="Nature of Business*" id="bnature" value={bizNature} onChange={setBizNature} Icon={BriefcaseIcon} placeholder="e.g., POS Services, General Merchandise" />
                  </div>
                  <div className="md:col-span-2">
                    <DataInput label="Business Full Address*" id="baddress" value={bizAddress} onChange={setBizAddress} Icon={HomeIcon} />
                  </div>
                  <DataInput label="State*" id="bstate" value={bizState} onChange={setBizState} Icon={MapPinIcon} />
                  <DataInput label="LGA*" id="blga" value={bizLga} onChange={setBizLga} Icon={MapPinIcon} />
                  <DataInput label="Business Phone*" id="bphone" value={bizPhone} onChange={setBizPhone} Icon={PhoneIcon} type="tel" />
                  <DataInput label="Business Email*" id="bemail" value={bizEmail} onChange={setBizEmail} Icon={EnvelopeIcon} type="email" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Proprietor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataInput label="First Name*" id="pfname" value={propFirstName} onChange={setPropFirstName} Icon={UserIcon} />
                  <DataInput label="Last Name*" id="plname" value={propLastName} onChange={setPropLastName} Icon={UserIcon} />
                  <DataInput label="Middle Name" id="pmname" value={propMiddleName} onChange={setPropMiddleName} Icon={UserIcon} isRequired={false} />
                  <DataInput label="NIN No.*" id="pnin" value={propNin} onChange={setPropNin} Icon={IdentificationIcon} type="tel" />
                  <div className="md:col-span-2">
                    <DataInput label="Full Address*" id="paddress" value={propAddress} onChange={setPropAddress} Icon={HomeIcon} />
                  </div>
                  <DataInput label="Phone Number*" id="pphone" value={propPhone} onChange={setPropPhone} Icon={PhoneIcon} type="tel" />
                  <DataInput label="Email*" id="pemail" value={propEmail} onChange={setPropEmail} Icon={EnvelopeIcon} type="email" />
                  <DataInput label="State*" id="pstate" value={propState} onChange={setPropState} Icon={MapPinIcon} />
                  <DataInput label="LGA*" id="plga" value={propLga} onChange={setPropLga} Icon={MapPinIcon} />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Upload Documents</h3>
                <div className="space-y-4">
                  <FileUpload label="Passport Photo*" id="pass" file={passportFile} fileUrl={passportUrl} isUploading={isUploadingPassport} onChange={(e: any) => e.target.files && handleFileUpload(e.target.files[0], setIsUploadingPassport, setPassportUrl)} />
                  <FileUpload label="Signature*" id="sign" file={signatureFile} fileUrl={signatureUrl} isUploading={isUploadingSignature} onChange={(e: any) => e.target.files && handleFileUpload(e.target.files[0], setIsUploadingSignature, setSignatureUrl)} />
                  <FileUpload label="NIN Slip*" id="nin" file={ninSlipFile} fileUrl={ninSlipUrl} isUploading={isUploadingNinSlip} onChange={(e: any) => e.target.files && handleFileUpload(e.target.files[0], setIsUploadingNinSlip, setNinSlipUrl)} />
                </div>
              </div>
            </div>
          )}

          {serviceType === 'DOC_RETRIEVAL' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-4">Document Details</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type*</label>
                  <div className="grid grid-cols-2 gap-3">
                    <ModTypeButton title="Business Certificate" description="Official Certificate" selected={docType === 'Certificate'} onClick={() => setDocType('Certificate')} />
                    <ModTypeButton title="Status Report" description="Current Status" selected={docType === 'Status Report'} onClick={() => setDocType('Status Report')} />
                  </div>
                </div>

                {docType && (
                  <div className="grid grid-cols-1 gap-4">
                    <DataInput label="Registered Business Name*" id="fullBiz" value={fullBizName} onChange={setFullBizName} Icon={BriefcaseIcon} placeholder="e.g. My Business Ventures" />
                    <DataInput label="Business Number (BN/RC)*" id="bizNum" value={bizNumber} onChange={setBizNumber} Icon={BuildingOfficeIcon} placeholder="e.g. BN123456" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Applicant Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataInput label="First Name*" id="pfname" value={propFirstName} onChange={setPropFirstName} Icon={UserIcon} />
                  <DataInput label="Last Name*" id="plname" value={propLastName} onChange={setPropLastName} Icon={UserIcon} />
                  <DataInput label="Phone Number*" id="pphone" value={propPhone} onChange={setPropPhone} Icon={PhoneIcon} type="tel" />
                  <DataInput label="Email Address*" id="pemail" value={propEmail} onChange={setPropEmail} Icon={EnvelopeIcon} type="email" />
                </div>
              </div>
            </div>
          )}

          {/* 3. Attestation & Submit */}
          {serviceType && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                <input
                  type="checkbox"
                  checked={hasAttested}
                  onChange={(e) => setHasAttested(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <p className="text-sm text-gray-600">
                  I attest that all information provided is accurate. I understand that incorrect information may lead to rejection by the CAC.
                </p>
              </div>

              {submitError && (
                <div className="p-3 mb-4 bg-red-50 text-red-700 text-sm rounded-lg text-center">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                Submit Request (₦{getFee().toLocaleString()})
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
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Submission</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Please verify all details are correct. This action cannot be undone.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-2xl font-bold text-blue-700">₦{getFee().toLocaleString()}</p>
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
