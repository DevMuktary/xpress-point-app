"use client"; 

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon, 
  IdentificationIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
  HomeIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  XMarkIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Types ---
type Props = {
  hasAlreadyAgreed: boolean;
  prices: { [key: string]: number };
  availability: { [key: string]: boolean };
};
type ServiceID = 'NIN_MOD_NAME' | 'NIN_MOD_DOB' | 'NIN_MOD_PHONE' | 'NIN_MOD_ADDRESS';

// --- Consent Modal (With FULL Terms) ---
const ConsentModal = ({ onAgree }: { onAgree: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);

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
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 text-sm text-gray-700">
          <p>Before you proceed, you must read and agree to the following terms. This is a one-time agreement.</p>
          
          <h4 className="font-bold text-gray-900">1. Authorization to Act on Your Behalf</h4>
          <p>I, the user, authorize Xpress Point and its trusted agents to access and use my personal data, including my NIN, to process the modification requested. I understand that Xpress Point is an independent agent and is <span className="font-bold">not</span> affiliated with NIMC.</p>
          
          <h4 className="font-bold text-gray-900">2. Your Voluntary Consent</h4>
          <p>NIMC recommends that NIN modifications be done personally. By agreeing, I confirm that due to technical difficulty, illiteracy, or convenience, I <span className="font-bold">voluntarily authorize</span> Xpress Point to perform this modification on my behalf. This applies whether I am the NIN owner or an agent acting with the full consent of the owner.</p>
          
          <h4 className="font-bold text-gray-900">3. Service Fees & No-Refund Policy</h4>
          <p>I agree to pay the non-refundable service fee. I understand that wallet funds are <span className="font-bold">non-withdrawable</span>. If a service fails due to an Admin or provider error (as specified in our auto-refund logic), the fee will be credited to my wallet, but it cannot be withdrawn. <span className="font-bold">A ₦500 charge for wrong submissions will be deducted from any refund.</span></p>
          
          <h4 className="font-bold text-gray-900">4. Your Responsibilities</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>I confirm all information I provide (like "New First Name" or "New Address") is 100% correct.</li>
            <li>I will <span className="font-bold">not</span> submit the same request on another platform while it is <span className="font-bold">PROCESSING</span> here. Doing so will forfeit my payment.</li>
            <li>If submitting for someone else, I confirm I have the NIN owner's full legal authorization.</li>
          </ul>
          
          <h4 className="font-bold text-gray-900">5. Provider Delays & Service Terms</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="font-bold">Bank/SIM Updates:</span> I understand that modifications reflect immediately on the NIMC portal, but banks and SIM providers may take a long time to sync. If I need this for an urgent bank transaction, I will not proceed.</li>
            <li><span className="font-bold">NIMC Delays:</span> If NIMC's network is down, I agree to wait patiently and will not submit duplicate requests.</li>
            <li><span className="font-bold">Alias Emails:</span> I understand that this platform uses secure, platform-owned "alias emails" to process all modifications.</li>
          </ul>
          
          <p>I have read, understood, and agreed to all the terms above. I authorize Xpress Point to proceed with my NIN modification.</p>
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

// --- Note Modal ---
const NoteModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-blue-800 flex items-center gap-2">
          <InformationCircleIcon className="h-6 w-6 text-blue-500" />
          Please Note
        </h2>
      </div>
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3 text-sm text-gray-700">
        <p><span className="font-bold">NOTE:</span> Modification will be processed and submitted on self service in 2 to 7 days. Approval and validation is up to NIMC.</p>
        <ul className="list-disc list-outside pl-5 space-y-2">
          <li>Our work is for Agents that know the process involved.</li>
          <li>Our only job is to Submit and get you the enrollment slip with a new Tracking ID.</li>
          <li>Approval and Validation is up to NIMC.</li>
          <li>Submit only Fresh Modification. Contact admin for any Modification that is not fresh.</li>
        </ul>
        <p><span className="font-bold">Please Take Note:</span> All Funds on the website can only be used for services on the website.</p>
        <p>Make sure you submit a <span className="font-bold">New Valid Fresh Email Address & its Password</span> when requesting the Modification.</p>
      </div>
      <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
        <Link
          href="/dashboard/services/nin"
          className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
        >
          Go Back
        </Link>
        <button
          onClick={onClose}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          I Understand
        </button>
      </div>
    </div>
  </div>
);

// --- Modern Button ---
const ModTypeButton = ({ title, description, selected, onClick, disabled = false }: {
  title: string, description: string, selected: boolean, onClick: () => void, disabled?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg p-4 text-left transition-all border-2
      ${disabled
        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
        : selected
          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500'
          : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
  >
    <p className={`font-semibold ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{title}</p>
    <p className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-blue-600'}`}>
        {disabled ? 'Unavailable' : description}
    </p>
  </button>
);

// --- Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "", maxLength = 524288 }: {
  label: string, id: string, value: string, onChange: (value: string) => void, Icon: React.ElementType, type?: string, isRequired?: boolean, placeholder?: string, maxLength?: number
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
        required={isRequired} placeholder={placeholder} maxLength={maxLength}
      />
    </div>
  </div>
);

const FileUpload = ({ label, id, file, onChange, fileUrl, isUploading, error }: {
  label: string, id: string, file: File | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, fileUrl: string | null, isUploading: boolean, error: string | null
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <input
        id={id} type="file" onChange={onChange}
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

export default function NinModificationClientPage({ hasAlreadyAgreed, prices, availability }: Props) {
  const router = useRouter();
  
  const [hasAgreed, setHasAgreed] = useState(hasAlreadyAgreed);
  const [serviceId, setServiceId] = useState<ServiceID | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(hasAlreadyAgreed); 

  const [formData, setFormData] = useState({
    nin: '', phone: '', email: '', password: '', firstName: '', lastName: '', middleName: '', oldName: '', newName: '', newPhone: '', address: '', state: '', lga: '', oldAddress: '', newAddress: '', oldDob: '', newDob: '', oldPhone: '',
  });

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [isUploadingPassport, setIsUploadingPassport] = useState(false);
  const [passportError, setPassportError] = useState<string | null>(null);

  const [attestationFile, setAttestationFile] = useState<File | null>(null);
  const [attestationUrl, setAttestationUrl] = useState<string | null>(null);
  const [isUploadingAttestation, setIsUploadingAttestation] = useState(false);
  const [attestationError, setAttestationError] = useState<string | null>(null);

  // --- UPDATED PRICING LOGIC ---
  const { totalFee, dobFeeText, isDobGap } = useMemo(() => {
    if (!serviceId) return { totalFee: 0, dobFeeText: null, isDobGap: false };
    
    // Get base price from DB or fallback
    let fee = prices[serviceId] || 0;
    let warningText = null;
    let gapFound = false;

    // Specific logic for DOB
    if (serviceId === 'NIN_MOD_DOB' && formData.oldDob && formData.newDob) {
      try {
        const oldDate = new Date(formData.oldDob);
        const newDate = new Date(formData.newDob);
        const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
        // Calculate years
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);

        if (diffYears > 5) {
          gapFound = true;
          if (diffYears <= 10) {
            fee += 35000;
            warningText = "Gap is 6-10 years. An additional ₦35,000 fee applies.";
          } else {
            fee += 45000;
            warningText = "Gap is over 10 years. An additional ₦45,000 fee applies.";
          }
        }
      } catch (e) {
        // Date parsing error
      }
    }
    return { totalFee: fee, dobFeeText: warningText, isDobGap: gapFound };
  }, [serviceId, formData.oldDob, formData.newDob, prices]);

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const uploadFile = async (file: File, setUrl: (url: string) => void, setError: (err: string) => void, setUploading: (val: boolean) => void) => {
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('attestation', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'File upload failed.');
      setUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!serviceId) {
      setSubmitError("Please select a modification type.");
      return;
    }
    if (!passportUrl) {
      setSubmitError("Please upload your Passport Photograph.");
      return;
    }
    if (serviceId === 'NIN_MOD_DOB' && !attestationUrl) {
      setSubmitError("Please upload the Attestation Letter.");
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    
    let payloadFormData = {
      nin: formData.nin,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    };
  
    if (serviceId === 'NIN_MOD_NAME') {
      Object.assign(payloadFormData, { oldName: formData.oldName, newName: formData.newName, firstName: formData.firstName, lastName: formData.lastName, middleName: formData.middleName });
    } else if (serviceId === 'NIN_MOD_PHONE') {
      Object.assign(payloadFormData, { oldPhone: formData.oldPhone, newPhone: formData.newPhone });
    } else if (serviceId === 'NIN_MOD_ADDRESS') {
      Object.assign(payloadFormData, { oldAddress: formData.oldAddress, newAddress: formData.address, state: formData.state, lga: formData.lga });
    } else if (serviceId === 'NIN_MOD_DOB') {
      Object.assign(payloadFormData, { oldDob: formData.oldDob, newDob: formData.newDob });
    }

    try {
      const response = await fetch('/api/services/nin/modification-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          formData: payloadFormData, 
          passportUrl,
          attestationUrl,
          isDobGap // Pass this so backend knows high fee applies
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed.');
      
      setSuccess(data.message);
      // Reset logic
      setFormData({ nin: '', phone: '', email: '', password: '', firstName: '', lastName: '', middleName: '', newPhone: '', address: '', state: '', lga: '', oldDob: '', newDob: '', oldName: '', newName: '', oldPhone: '', oldAddress: '', newAddress: '' });
      setPassportFile(null); setPassportUrl(null);
      setAttestationFile(null); setAttestationUrl(null);
      setServiceId(null);
      setIsNoteModalOpen(true);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!hasAgreed) return <ConsentModal onAgree={() => setHasAgreed(true)} />;
  if (isNoteModalOpen) return <NoteModal onClose={() => setIsNoteModalOpen(false)} />;

  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}
      
      <div className="rounded-lg bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold text-red-800">
              Submit only Fresh Modification, we charge ₦500 for Invalid Modification. You cannot submit the same modification request to another platform while we process it. Violating this policy will result in no refund.
            </p>
          </div>
        </div>
      </div>
      
      {success && (
        <div className="rounded-lg bg-green-100 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0"><CheckCircleIcon className="h-5 w-5 text-green-500" /></div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-green-800">Request Submitted Successfully!</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your request is now <strong className="font-semibold">PENDING</strong>. 
                  You can monitor its status on the <Link href="/dashboard/history/modification" className="font-semibold underline hover:text-green-600">NIN Modification History</Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          <div>
            <label className="text-lg font-semibold text-gray-900">1. Select Modification Type</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <ModTypeButton title="Change of Name" description={`Fee: ₦${prices['NIN_MOD_NAME'] || 0}`} selected={serviceId === 'NIN_MOD_NAME'} disabled={!availability['NIN_MOD_NAME']} onClick={() => setServiceId('NIN_MOD_NAME')} />
              <ModTypeButton title="Change of Phone" description={`Fee: ₦${prices['NIN_MOD_PHONE'] || 0}`} selected={serviceId === 'NIN_MOD_PHONE'} disabled={!availability['NIN_MOD_PHONE']} onClick={() => setServiceId('NIN_MOD_PHONE')} />
              <ModTypeButton title="Change of Address" description={`Fee: ₦${prices['NIN_MOD_ADDRESS'] || 0}`} selected={serviceId === 'NIN_MOD_ADDRESS'} disabled={!availability['NIN_MOD_ADDRESS']} onClick={() => setServiceId('NIN_MOD_ADDRESS')} />
              <ModTypeButton title="Change of Date of Birth" description={`Fee: ₦${prices['NIN_MOD_DOB'] || 0} (Base)`} selected={serviceId === 'NIN_MOD_DOB'} disabled={!availability['NIN_MOD_DOB']} onClick={() => setServiceId('NIN_MOD_DOB')} />
            </div>
          </div>

          {serviceId && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              <DataInput label="NIN Number*" id="nin" value={formData.nin} onChange={(v) => handleInputChange('nin', v)} Icon={IdentificationIcon} type="tel" maxLength={11} />

              {serviceId === 'NIN_MOD_NAME' && (
                <>
                  <DataInput label="Old Full Name*" id="oldName" value={formData.oldName} onChange={(v) => handleInputChange('oldName', v)} Icon={UserIcon} />
                  <DataInput label="New First Name*" id="firstName" value={formData.firstName} onChange={(v) => handleInputChange('firstName', v)} Icon={UserIcon} />
                  <DataInput label="New Last Name*" id="lastName" value={formData.lastName} onChange={(v) => handleInputChange('lastName', v)} Icon={UserIcon} />
                  <DataInput label="New Middle Name (Optional)" id="middleName" value={formData.middleName} onChange={(v) => handleInputChange('middleName', v)} Icon={UserIcon} isRequired={false} />
                </>
              )}
              {serviceId === 'NIN_MOD_PHONE' && (
                <>
                  <DataInput label="Old Phone Number*" id="oldPhone" value={formData.oldPhone} onChange={(v) => handleInputChange('oldPhone', v)} Icon={PhoneIcon} type="tel" maxLength={11} />
                  <DataInput label="New Phone Number*" id="newPhone" value={formData.newPhone} onChange={(v) => handleInputChange('newPhone', v)} Icon={PhoneIcon} type="tel" maxLength={11} />
                </>
              )}
              {serviceId === 'NIN_MOD_ADDRESS' && (
                <>
                  <DataInput label="Old Address*" id="oldAddress" value={formData.oldAddress} onChange={(v) => handleInputChange('oldAddress', v)} Icon={HomeIcon} />
                  <DataInput label="New Address*" id="address" value={formData.address} onChange={(v) => handleInputChange('address', v)} Icon={HomeIcon} />
                  <DataInput label="State*" id="state" value={formData.state} onChange={(v) => handleInputChange('state', v)} Icon={MapPinIcon} />
                  <DataInput label="LGA*" id="lga" value={formData.lga} onChange={(v) => handleInputChange('lga', v)} Icon={MapPinIcon} />
                </>
              )}
              {serviceId === 'NIN_MOD_DOB' && (
                <>
                  <DataInput label="Old Date of Birth*" id="oldDob" value={formData.oldDob} onChange={(v) => handleInputChange('oldDob', v)} Icon={CalendarDaysIcon} type="date" />
                  <DataInput label="New Date of Birth*" id="newDob" value={formData.newDob} onChange={(v) => handleInputChange('newDob', v)} Icon={CalendarDaysIcon} type="date" />
                  
                  {dobFeeText && (
                    <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-bold text-yellow-800">Additional Fee Detected</h3>
                          <p className="text-sm text-yellow-700">{dobFeeText}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <DataInput label="Your Current Phone Number*" id="phone" value={formData.phone} onChange={(v) => handleInputChange('phone', v)} Icon={PhoneIcon} type="tel" maxLength={11} />
              <DataInput label="New Valid Fresh Email*" id="email" value={formData.email} onChange={(v) => handleInputChange('email', v)} Icon={EnvelopeIcon} type="email" />
              <DataInput label="Email Password*" id="password" value={formData.password} onChange={(v) => handleInputChange('password', v)} Icon={LockClosedIcon} type="password" />

              <h3 className="text-lg font-semibold text-gray-900 pt-4">3. Upload Documents</h3>
              
              <FileUpload 
                label="Passport Photograph (Clear Background)*" 
                id="passport" 
                file={passportFile} 
                fileUrl={passportUrl} 
                isUploading={isUploadingPassport} 
                error={passportError}
                onChange={(e) => { 
                   if (e.target.files && e.target.files[0]) {
                     setPassportFile(e.target.files[0]);
                     uploadFile(e.target.files[0], setPassportUrl, setPassportError, setIsUploadingPassport);
                   }
                }}
              />

              {serviceId === 'NIN_MOD_DOB' && (
                <div className="mt-4">
                  <FileUpload 
                    label="Attestation Letter*" 
                    id="attestation" 
                    file={attestationFile} 
                    fileUrl={attestationUrl} 
                    isUploading={isUploadingAttestation} 
                    error={attestationError}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttestationFile(e.target.files[0]);
                        uploadFile(e.target.files[0], setAttestationUrl, setAttestationError, setIsUploadingAttestation);
                      }
                    }}
                  />
                  <p className="text-xs text-blue-600 font-medium -mt-2">
                    Don't have an attestation letter? <Link href="/dashboard/services/nin/attestation" className="underline hover:text-blue-800">Get one from us</Link>
                  </p>
                </div>
              )}
            </div>
          )}
          
          {serviceId && (
            <div className="border-t border-gray-200 pt-6">
              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || isUploadingPassport || isUploadingAttestation || !passportUrl || (serviceId === 'NIN_MOD_DOB' && !attestationUrl)}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : `Submit Modification (Fee: ₦${totalFee.toLocaleString()})`}
              </button>
            </div>
          )}
        </form>
      </div>

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
                Please confirm you have filled in the right details. This action is irreversible.
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{totalFee.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-700"
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
