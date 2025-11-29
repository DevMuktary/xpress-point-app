"use client"; // This is an interactive component

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
  XMarkIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// Define the props to receive the initial data from the server
type Props = {
  hasAlreadyAgreed: boolean;
  prices: { [key: string]: number };
  availability: { [key: string]: boolean }; // <--- ADDED THIS
};

// Define the types
type ModType = 'NAME' | 'PHONE' | 'ADDRESS' | 'DOB';

// --- Consent Text ---
const ConsentText = () => (
  <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
    <p>Before you proceed, you must read and agree to the following terms. This is a one-time agreement.</p>
    <h4 className="font-bold text-gray-900">1. Authorization to Act on Your Behalf</h4>
    <p>I, the user, authorize Xpress Point and its trusted agents to access and use my personal data, including my NIN, to process the modification requested. I understand that Xpress Point is an independent agent and is <strong className="font-semibold">not</strong> affiliated with NIMC.</p>
    <h4 className="font-bold text-gray-900">2. Your Voluntary Consent</h4>
    <p>NIMC recommends that NIN modifications be done personally. By agreeing, I confirm that due to technical difficulty, illiteracy, or convenience, I <strong className="font-semibold">voluntarily authorize</strong> Xpress Point to perform this modification on my behalf. This applies whether I am the NIN owner or an agent acting with the full consent of the owner.</p>
    <h4 className="font-bold text-gray-900">3. Service Fees & No-Refund Policy</h4>
    <p>I agree to pay the non-refundable service fee. I understand that wallet funds are <strong className="font-semibold">non-withdrawable</strong>. If a service fails due to an Admin or provider error (as specified in our auto-refund logic), the fee will be credited to my wallet, but it cannot be withdrawn. <strong className="font-semibold">A ₦500 charge for wrong submissions will be deducted from any refund.</strong></p>
    <h4 className="font-bold text-gray-900">4. Your Responsibilities</h4>
    <ul className="list-disc list-inside space-y-1">
      <li>I confirm all information I provide (like "New First Name" or "New Address") is 100% correct.</li>
      <li>I will <strong className="font-semibold">not</strong> submit the same request on another platform while it is <strong className="font-semibold">PROCESSING</strong> here. Doing so will forfeit my payment.</li>
      <li>If submitting for someone else, I confirm I have the NIN owner's full legal authorization.</li>
    </ul>
    <h4 className="font-bold text-gray-900">5. Provider Delays & Service Terms</h4>
    <ul className="list-disc list-inside space-y-1">
      <li><strong className="font-semibold">Bank/SIM Updates:</strong> I understand that modifications reflect immediately on the NIMC portal, but banks and SIM providers may take a long time to sync. If I need this for an urgent bank transaction, I will not proceed.</li>
      <li><strong className="font-semibold">NIMC Delays:</strong> If NIMC's network is down, I agree to wait patiently and will not submit duplicate requests.</li>
      <li><strong className="font-semibold">Alias Emails:</strong> I understand that this platform uses secure, platform-owned "alias emails" to process all modifications.</li>
    </ul>
    <p>I have read, understood, and agree to all the terms above. I authorize Xpress Point to proceed with my NIN modification.</p>
  </div>
);

// --- UPDATED "Modern Button" Component ---
const ModTypeButton = ({ title, description, selected, onClick, disabled = false }: {
  title: string,
  description: string,
  selected: boolean,
  onClick: () => void,
  disabled?: boolean // <--- Added disabled support
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg p-4 text-left transition-all border-2
      ${disabled
        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' // Disabled styles
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

// --- The Main Component ---
export default function ModificationClientPage({ hasAlreadyAgreed, prices, availability }: Props) {
  const router = useRouter();
   
  // --- State Management ---
  const [hasAgreed, setHasAgreed] = useState(hasAlreadyAgreed);
  const [modType, setModType] = useState<ModType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
   
  // --- Form Data State ---
  const [nin, setNin] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [oldDob, setOldDob] = useState('');
  const [newDob, setNewDob] = useState('');
  const [attestation, setAttestation] = useState<File | null>(null);
  const [attestationUrl, setAttestationUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // --- Pricing Logic ---
  const isDobGap = useMemo(() => {
    if (modType !== 'DOB' || !oldDob || !newDob) return false;
    try {
      const oldDate = new Date(oldDob);
      const newDate = new Date(newDob);
      const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      return diffYears > 5;
    } catch {
      return false;
    }
  }, [oldDob, newDob, modType]);
   
  const getFee = () => {
    // Fallback prices if map is missing, but server usually provides them
    if (modType === 'NAME') return prices['NIN_MOD_NAME'] || 2000;
    if (modType === 'PHONE') return prices['NIN_MOD_PHONE'] || 1000;
    if (modType === 'ADDRESS') return prices['NIN_MOD_ADDRESS'] || 1500;
    if (modType === 'DOB') {
      const baseFee = prices['NIN_MOD_DOB'] || 15000;
      return isDobGap ? baseFee + 7000 : baseFee;
    }
    return 0;
  };

  // --- API 1: Handle Agreeing to Terms ---
  const handleAgree = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await fetch('/api/auth/agree-mod-terms', { method: 'POST' });
      setHasAgreed(true);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle File Upload ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAttestation(file);
    setIsUploading(true);
    setSubmitError(null);
    setAttestationUrl(null); 
     
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
      setAttestationUrl(data.url);
    } catch (err: any) {
      setSubmitError(err.message);
      setAttestation(null); 
    } finally {
      setIsUploading(false);
    }
  };

  // --- Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault(); 
    setSubmitError(null);
    setSuccess(null);

    if (!modType) {
      setSubmitError("Please select a modification type.");
      return;
    }
    if (modType === 'DOB' && !attestationUrl) {
      setSubmitError("Please wait for the Attestation Document to finish uploading.");
      return;
    }
     
    setIsConfirmModalOpen(true);
  };
   
  // --- Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false); 
    setIsSubmitting(true); 
     
    let serviceId = '';
    let formData: any = { nin, phone, email, password };

    if (modType === 'NAME') {
      serviceId = 'NIN_MOD_NAME';
      formData = { ...formData, firstName, lastName, middleName };
    } else if (modType === 'PHONE') {
      serviceId = 'NIN_MOD_PHONE';
      formData = { ...formData, newPhone };
    } else if (modType === 'ADDRESS') {
      serviceId = 'NIN_MOD_ADDRESS';
      formData = { ...formData, address, state, lga };
    } else if (modType === 'DOB') {
      serviceId = 'NIN_MOD_DOB';
      formData = { ...formData, oldDob, newDob };
    }

    try {
      const response = await fetch('/api/services/nin/modification-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          formData, 
          isDobGap,
          attestationUrl
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message);
      // Reset the form
      setNin(''); setPhone(''); setEmail(''); setPassword('');
      setFirstName(''); setLastName(''); setMiddleName('');
      setNewPhone(''); setAddress(''); setState(''); setLga('');
      setOldDob(''); setNewDob(''); setAttestation(null); setAttestationUrl(null);
      setModType(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
   
  // --- Consent Form ---
  if (!hasAgreed) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        {isSubmitting && <Loading />}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Authorization Agreement</h2>
        
        <ConsentText />
        
        {submitError && (
          <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p>
        )}
        
        <div className="mt-6 flex gap-4 border-t border-gray-200 pt-4">
          <Link 
            href="/dashboard/services/nin"
            className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
          >
            NOT AGREED
          </Link>
          <button
            onClick={handleAgree}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            I AGREED
          </button>
        </div>
      </div>
    );
  }

  // --- Main Form ---
  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}
      
      {/* --- 1. The "No Refund" Warning --- */}
      <div className="rounded-lg bg-red-50 p-4 border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-red-800">
              Important: No Refunds
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Refund is only for certain circumstances. A <strong className="font-semibold">₦500 processing fee</strong> for wrong submissions will be deducted from any refund.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Success Message --- */}
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
                  <Link href="/dashboard/history/modification" className="font-semibold underline hover:text-blue-600">
                    NIN Modification History
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
          
          {/* --- Buttons for Mod Type --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Modification Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ModTypeButton
                title="Change of Name"
                description={`Fee: ₦${prices['NIN_MOD_NAME']?.toLocaleString() || '...'}`}
                selected={modType === 'NAME'}
                disabled={!availability['NIN_MOD_NAME']} // <--- Disable if offline
                onClick={() => setModType('NAME')}
              />
              <ModTypeButton
                title="Change of Phone"
                description={`Fee: ₦${prices['NIN_MOD_PHONE']?.toLocaleString() || '...'}`}
                selected={modType === 'PHONE'}
                disabled={!availability['NIN_MOD_PHONE']} // <--- Disable if offline
                onClick={() => setModType('PHONE')}
              />
              <ModTypeButton
                title="Change of Address"
                description={`Fee: ₦${prices['NIN_MOD_ADDRESS']?.toLocaleString() || '...'}`}
                selected={modType === 'ADDRESS'}
                disabled={!availability['NIN_MOD_ADDRESS']} // <--- Disable if offline
                onClick={() => setModType('ADDRESS')}
              />
              <ModTypeButton
                title="Change of Date of Birth"
                description={`Fee: ₦${prices['NIN_MOD_DOB']?.toLocaleString() || '...'}`}
                selected={modType === 'DOB'}
                disabled={!availability['NIN_MOD_DOB']} // <--- Disable if offline
                onClick={() => setModType('DOB')}
              />
            </div>
          </div>

          {/* --- Common Fields --- */}
          {modType && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} type="tel" maxLength={11} />

              {/* --- Conditional Fields --- */}
              {modType === 'NAME' && (
                <>
                  <DataInput label="New First Name*" id="fname" value={firstName} onChange={setFirstName} Icon={UserIcon} />
                  <DataInput label="New Last Name*" id="lname" value={lastName} onChange={setLastName} Icon={UserIcon} />
                  <DataInput label="New Middle Name (Optional)" id="mname" value={middleName} onChange={setMiddleName} Icon={UserIcon} isRequired={false} />
                </>
              )}
              {modType === 'PHONE' && (
                <DataInput label="New Phone Number*" id="newphone" value={newPhone} onChange={setNewPhone} Icon={PhoneIcon} type="tel" maxLength={11} />
              )}
              {modType === 'ADDRESS' && (
                <>
                  <DataInput label="New Address*" id="address" value={address} onChange={setAddress} Icon={HomeIcon} />
                  <DataInput label="State*" id="state" value={state} onChange={setState} Icon={MapPinIcon} />
                  <DataInput label="LGA*" id="lga" value={lga} onChange={setLga} Icon={MapPinIcon} />
                </>
              )}
              {modType === 'DOB' && (
                <>
                  <DataInput label="Old Date of Birth*" id="oldDob" value={oldDob} onChange={setOldDob} Icon={CalendarDaysIcon} type="date" />
                  <DataInput label="New Date of Birth*" id="newDob" value={newDob} onChange={setNewDob} Icon={CalendarDaysIcon} type="date" />
                  
                  {isDobGap && (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-bold text-yellow-800">Additional Fee</h3>
                          <p className="text-sm text-yellow-700">The gap between DOBs is over 5 years. An additional ₦7,000 fee will be applied.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="attestation" className="block text-sm font-medium text-gray-700">Upload Attestation Document*</label>
                    <div className="mt-1 flex items-center gap-4">
                      <input
                        id="attestation"
                        type="file"
                        onChange={handleFileChange}
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
                      {attestationUrl && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {attestation ? attestation.name : "Please upload a PNG, JPG, or PDF."}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      Don't have an attestation letter? <Link href="/dashboard/services/nin/attestation" className="underline hover:text-blue-800">Get one from us</Link>
                    </p>
                  </div>
                </>
              )}

              {/* --- Common Email/Password Fields --- */}
              <DataInput label="Your Current Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" maxLength={11} />
              <DataInput label="New Valid Fresh Email*" id="email" value={email} onChange={setEmail} Icon={EnvelopeIcon} type="email" />
              <DataInput label="Email Password*" id="password" value={password} onChange={setPassword} Icon={LockClosedIcon} type="password" />
            </div>
          )}
          
          {/* --- Submit Button --- */}
          {modType && (
            <div className="border-t border-gray-200 pt-6">
              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || (modType === 'DOB' && isUploading)}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : `Submit Modification (Fee: ₦${getFee().toLocaleString()})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
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
                is non-refundable as per the terms you agreed to.
              </p>
              <p className="mt-4 text-center text-2xl font-bold text-blue-600">
                Total Fee: ₦{getFee().toLocaleString()}
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

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, maxLength = 524288 }: {
  label: string,
  id: string,
  value: string,
  onChange: (value: string) => void,
  Icon: React.ElementType,
  type?: string,
  isRequired?: boolean,
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
        maxLength={maxLength}
      />
    </div>
  </div>
);
