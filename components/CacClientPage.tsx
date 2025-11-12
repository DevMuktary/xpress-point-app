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
  XMarkIcon
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
export default function CacClientPage() {
  
  // --- State Management ---
  const [serviceType, setServiceType] = useState<'REG_BN' | 'DOC_RETRIEVAL' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasAttested, setHasAttested] = useState(false);

  // --- Form Data States ---
  // Business Reg
  const [bizName1, setBizName1] = useState('');
  const [bizName2, setBizName2] = useState('');
  const [bizNature, setBizNature] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizState, setBizState] = useState('');
  const [bizLga, setBizLga] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  
  // Proprietor
  const [propFirstName, setPropFirstName] = useState('');
  const [propLastName, setPropLastName] = useState('');
  const [propMiddleName, setPropMiddleName] = useState('');
  const [propNin, setPropNin] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propPhone, setPropPhone] = useState('');
  const [propEmail, setPropEmail] = useState('');
  const [propState, setPropState] = useState('');
  const [propLga, setPropLga] = useState('');

  // Doc Retrieval
  const [docType, setDocType] = useState<'Certificate' | 'Status Report' | null>(null);
  const [fullBizName, setFullBizName] = useState('');
  const [bizNumber, setBizNumber] = useState('');

  // --- File Upload States ---
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [passportError, setPassportError] = useState<string | null>(null);
  
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const [ninSlipFile, setNinSlipFile] = useState<File | null>(null);
  const [ninSlipUrl, setNinSlipUrl] = useState<string | null>(null);
  const [isUploadingNinSlip, setIsUploadingNinSlip] = useState(false);
  const [ninSlipError, setNinSlipError] = useState<string | null>(null);

  // --- "World-Class" File Upload Handler ---
  const handleFileUpload = async (
    file: File, 
    setUploading: (is: boolean) => void, 
    setUrl: (url: string | null) => void, 
    setError: (err: string | null) => void
  ) => {
    setUploading(true);
    setError(null);
    setUrl(null);

    try {
      const formData = new FormData();
      formData.append('attestation', file); // API expects 'attestation'

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'File upload failed.');
      }
      setUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- API: Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccess(null);

    if (!hasAttested) {
      setSubmitError("You must agree to the attestation before submitting.");
      setIsSubmitting(false);
      return;
    }

    let serviceId = '';
    let formData: any = {};
    let attestationUrls: any = {};

    if (serviceType === 'REG_BN') {
      serviceId = 'CAC_REG_BN';
      formData = { 
        bizName1, bizName2, bizNature, bizAddress, bizState, bizLga, bizPhone, bizEmail,
        propFirstName, propLastName, propMiddleName, propNin, propAddress, propPhone, propEmail, propState, propLga
      };
      if (!passportUrl || !signatureUrl || !ninSlipUrl) {
        setSubmitError("All 3 documents (Passport, Signature, NIN Slip) must be uploaded.");
        setIsSubmitting(false);
        return;
      }
      attestationUrls = {
        passportUrl: passportUrl,
        signatureUrl: signatureUrl,
        ninSlipUrl: ninSlipUrl
      };
    } else if (serviceType === 'DOC_RETRIEVAL') {
      serviceId = 'CAC_DOC_RETRIEVAL';
      formData = {
        docType, fullBizName, bizNumber, 
        proprietorName: propFirstName, // Re-using state
        proprietorPhone: propPhone,
        proprietorEmail: propEmail
      };
    } else {
      setSubmitError("Please select a service type.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/services/cac/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, formData, ...attestationUrls }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message); // Your "Sweet Alert" - style message
      // Reset the form
      setServiceType(null); setHasAttested(false);
      setBizName1(''); setBizName2(''); setBizNature(''); setBizAddress(''); setBizState(''); setBizLga(''); setBizPhone(''); setBizEmail('');
      setPropFirstName(''); setPropLastName(''); setPropMiddleName(''); setPropNin(''); setPropAddress(''); setPropPhone(''); setPropEmail(''); setPropState(''); setPropLga('');
      setDocType(null); setFullBizName(''); setBizNumber('');
      setPassportFile(null); setPassportUrl(null); setSignatureFile(null); setSignatureUrl(null); setNinSlipFile(null); setNinSlipUrl(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getFee = () => {
    if (serviceType === 'REG_BN') return 18000;
    if (serviceType === 'DOC_RETRIEVAL') return 5000;
    return 0;
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
                  <Link href="/dashboard/history/cac" className="font-semibold underline hover:text-blue-600">
                    CAC History
                  </Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        {/* --- THIS IS THE FIX (Part 4) --- */}
        {/* The form now calls the 'handleOpenConfirmModal' function first */}
        <form onSubmit={(e) => { e.preventDefault(); setIsConfirmModalOpen(true); }} className="space-y-6">
          
          {/* --- "Modern Buttons" for Service Type --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Service Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ModTypeButton
                title="Business Name (BN) Reg."
                description="Fee: ₦18000"
                selected={serviceType === 'REG_BN'}
                onClick={() => setServiceType('REG_BN')}
              />
              <ModTypeButton
                title="Document Retrieval"
                description="Fee: ₦5000"
                selected={serviceType === 'DOC_RETRIEVAL'}
                onClick={() => setServiceType('DOC_RETRIEVAL')}
              />
            </div>
          </div>

          {/* --- Form Section for Business Reg (BN) --- */}
          {serviceType === 'REG_BN' && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Business Details</h3>
              <DataInput label="Proposed Name 1*" id="bname1" value={bizName1} onChange={setBizName1} Icon={BriefcaseIcon} />
              <DataInput label="Proposed Name 2*" id="bname2" value={bizName2} onChange={setBizName2} Icon={BriefcaseIcon} />
              <DataInput label="Nature of Business*" id="bnature" value={bizNature} onChange={setBizNature} Icon={BriefcaseIcon} placeholder="e.g., Fashion Design, POS Services" />
              <DataInput label="Business Full Address*" id="baddress" value={bizAddress} onChange={setBizAddress} Icon={HomeIcon} />
              <DataInput label="State*" id="bstate" value={bizState} onChange={setBizState} Icon={MapPinIcon} />
              <DataInput label="LGA*" id="blga" value={bizLga} onChange={setBizLga} Icon={MapPinIcon} />
              <DataInput label="Business Phone*" id="bphone" value={bizPhone} onChange={setBizPhone} Icon={PhoneIcon} type="tel" />
              <DataInput label="Business Email*" id="bemail" value={bizEmail} onChange={setBizEmail} Icon={EnvelopeIcon} type="email" />

              <h3 className="text-lg font-semibold text-gray-900 pt-4">3. Proprietor Details</h3>
              <DataInput label="First Name*" id="pfname" value={propFirstName} onChange={setPropFirstName} Icon={UserIcon} />
              <DataInput label="Last Name*" id="plname" value={propLastName} onChange={setPropLastName} Icon={UserIcon} />
              <DataInput label="Middle Name (Optional)" id="pmname" value={propMiddleName} onChange={setPropMiddleName} Icon={UserIcon} isRequired={false} />
              <DataInput label="NIN No.*" id="pnin" value={propNin} onChange={setPropNin} Icon={IdentificationIcon} type="tel" />
              <DataInput label="Full Address*" id="paddress" value={propAddress} onChange={setPropAddress} Icon={HomeIcon} />
              <DataInput label="Phone Number*" id="pphone" value={propPhone} onChange={setPropPhone} Icon={PhoneIcon} type="tel" />
              <DataInput label="Email*" id="pemail" value={propEmail} onChange={setPropEmail} Icon={EnvelopeIcon} type="email" />
              <DataInput label="State*" id="pstate" value={propState} onChange={setPropState} Icon={MapPinIcon} />
              <DataInput label="LGA*" id="plga" value={propLga} onChange={setPropLga} Icon={MapPinIcon} />
              
              <h3 className="text-lg font-semibold text-gray-900 pt-4">4. Proprietor Documents</h3>
              <FileUpload 
                label="Passport (Photo)*" id="passport" 
                file={passportFile} fileUrl={passportUrl} 
                isUploading={isUploadingPassport} error={passportError}
                onChange={(e) => { 
                  if(e.target.files) {
                    setPassportFile(e.target.files[0]); 
                    handleFileUpload(e.target.files[0], setIsUploadingPassport, setPassportUrl, setPassportError);
                  }
                }} 
              />
              <FileUpload 
                label="Signature*" id="signature"
                file={signatureFile} fileUrl={signatureUrl}
                isUploading={isUploadingSignature} error={signatureError}
                onChange={(e) => { 
                  if(e.target.files) {
                    setSignatureFile(e.target.files[0]); 
                    handleFileUpload(e.target.files[0], setIsUploadingSignature, setSignatureUrl, setSignatureError);
                  }
                }}
              />
              <FileUpload 
                label="NIN Slip*" id="ninslip"
                file={ninSlipFile} fileUrl={ninSlipUrl}
                isUploading={isUploadingNinSlip} error={ninSlipError}
                onChange={(e) => { 
                  if(e.target.files) {
                    setNinSlipFile(e.target.files[0]); 
                    handleFileUpload(e.target.files[0], setIsUploadingNinSlip, setNinSlipUrl, setNinSlipError);
                  }
                }}
              />
            </div>
          )}

          {/* --- Form Section for Document Retrieval --- */}
          {serviceType === 'DOC_RETRIEVAL' && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Select Document Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ModTypeButton
                    title="Business Certificate"
                    description="Official Certificate"
                    selected={docType === 'Certificate'}
                    onClick={() => setDocType('Certificate')}
                  />
                  <ModTypeButton
                    title="Status Report"
                    description="Current status"
                    selected={docType === 'Status Report'}
                    onClick={() => setDocType('Status Report')}
                  />
              </div>

              {docType && (
                <div className="pt-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">3. Enter Required Details</h3>
                  <DataInput label="Full Business Name*" id="fullBizName" value={fullBizName} onChange={setFullBizName} Icon={BriefcaseIcon} />
                  <DataInput label="Business Number (BN/RC)*" id="bizNumber" value={bizNumber} onChange={setBizNumber} Icon={BuildingOfficeIcon} />
                  <DataInput label="Proprietor Full Name*" id="propName" value={propFirstName} onChange={setPropFirstName} Icon={UserIcon} />
                  <DataInput label="Proprietor Phone Number*" id="propPhone" value={propPhone} onChange={setPropPhone} Icon={PhoneIcon} type="tel" />
                  <DataInput label="Proprietor Email*" id="propEmail" value={propEmail} onChange={setPropEmail} Icon={EnvelopeIcon} type="email" />
                </div>
              )}
            </div>
          )}
          
          {/* --- Attestation & Submit Button --- */}
          {serviceType && (
            <div className="border-t border-gray-200 pt-6 space-y-6">
              {/* --- Your "World-Class" Attestation --- */}
              <div className="relative flex items-start rounded-lg bg-gray-50 p-4 border border-gray-200">
                <div className="flex h-6 items-center">
                  <input
                    id="attestation"
                    name="attestation"
                    type="checkbox"
                    checked={hasAttested}
                    onChange={(e) => setHasAttested(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                </div>
                <div className="ml-3 text-sm leading-6">
                  <label htmlFor="attestation" className="font-medium text-gray-900">
                    Attestation
                  </label>
                  <p className="text-gray-700">
                    I attest that all information and documents supplied are correct, valid, and accurate. I understand Xpress Point (https://xpresspoint.net) shall not be liable for any wrong information provided by me.
                  </p>
                </div>
              </div>

              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit" // This now opens the modal
                disabled={isSubmitting || isUploadingPassport || isUploadingSignature || isUploadingNinSlip || !hasAttested}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : `Submit Request (Fee: ₦${getFee()})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- Your "World-Class" Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-center text-gray-600">
                Please confirm you have filled in the right details. This action
                is unreverse-able.
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{getFee()}
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit} // This is the REAL submit
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
