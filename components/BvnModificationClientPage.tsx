"use client"; // This is an interactive component

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  IdentificationIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Type Definitions ---
type Props = {
  prices: { [key: string]: number };
};
type BankType = 'Agency BVN' | 'B.O.A' | 'NIBSS Microfinance' | 'Enterprise Bank' | 'Heritage Bank' | 'FCMB' | 'First Bank' | 'Keystone Bank';
type ModType = 'BVN_MOD_NAME' | 'BVN_MOD_DOB' | 'BVN_MOD_PHONE' | 'BVN_MOD_NAME_DOB' | 'BVN_MOD_NAME_PHONE' | 'BVN_MOD_DOB_PHONE';

const banksList: BankType[] = [
  'Agency BVN', 'B.O.A', 'NIBSS Microfinance', 'Enterprise Bank', 
  'Heritage Bank', 'FCMB', 'First Bank', 'Keystone Bank'
];
const modTypes: { id: ModType, name: string }[] = [
  { id: 'BVN_MOD_NAME', name: 'Change of Name' },
  { id: 'BVN_MOD_DOB', name: 'Change of DOB' },
  { id: 'BVN_MOD_PHONE', name: 'Change of Phone' },
  { id: 'BVN_MOD_NAME_DOB', name: 'Name & DOB' },
  { id: 'BVN_MOD_NAME_PHONE', name: 'Name & Phone' },
  { id: 'BVN_MOD_DOB_PHONE', name: 'DOB & Phone' },
];

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
      ${selected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400'}`}
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  </div>
);

// --- The Consent Modal Component ---
const BvnModificationTermsModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-bold text-red-800 flex items-center gap-2">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          BVN Modification Terms
        </h2>
        <button onClick={onClose}>
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3 text-sm text-gray-700">
        <p>1. Make sure it is an <span className="font-bold">Agency Enrollment</span> or one of the <span className="font-bold">Listed Banks</span>. Ask the customer if he has ever made a modification before.</p>
        <p>2. If he did NIN Modification, make sure the modification is reflecting on <span className="font-bold">VNIN Slip</span> (NIMC Server). NIBSS Don't Do Double Modification.</p>
        <p>3. You Can Only Change Your Details <span className="font-bold">Once</span>. e.g if you modified your Name, you can't do it Again, you are eligible to modify DOB, Phone Number and so on, same thing if its DOB.</p>
        <p>4. <span className="font-bold text-red-700">NO REFUND</span> if we processed your work and we later found out:</p>
        <ul className="list-disc list-inside pl-4">
          <li>It's a Bank Enrollment (Except Listed Banks).</li>
          <li>Your Old NIN Details are incorrect.</li>
          <li>Or you have already done a similar modification.</li>
        </ul>
        <p>5. <span className="font-bold">Listed Banks:</span> Agency BVN, B.O.A (Bank of Agriculture), NIBSS Microfinance, Enterprise Bank, Heritage Bank, FCMB, First Bank, Keystone Bank.</p>
        <p className="font-bold text-red-700">6. Do NOT submit a "Complete Change of Name" (First, Middle, and Last) as the service is currently down.</p>
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
export default function BvnModificationClientPage({ prices }: Props) {
  
  // --- State Management ---
  const [bankType, setBankType] = useState<BankType | null>(null);
  const [serviceId, setServiceId] = useState<ModType | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(true); 

  // --- Form Data State ---
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newMiddleName, setNewMiddleName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [oldDob, setOldDob] = useState('');
  const [newDob, setNewDob] = useState('');
  const [fullName, setFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Dynamic Fee Calculation ---
  const { totalFee, dobFee, dobError } = useMemo(() => {
    if (!serviceId || !bankType) return { totalFee: 0, dobFee: 0, dobError: null };

    const baseFee = prices[serviceId] || 0;
    let dobFee = 0;
    let dobError: string | null = null;
    
    if ((serviceId.includes('DOB')) && oldDob && newDob) {
      try {
        const oldDate = new Date(oldDob);
        const newDate = new Date(newDob);
        const diffTime = Math.abs(newDate.getTime() - oldDate.getTime());
        const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
        
        if (diffYears > 5) {
          if (['FCMB', 'First Bank', 'Keystone Bank'].includes(bankType)) {
            dobError = "DOB modification over 5 years is NOT supported for this bank.";
            dobFee = 0;
          } else if (['Agency BVN', 'B.O.A', 'NIBSS Microfinance', 'Enterprise Bank', 'Heritage Bank'].includes(bankType)) {
            dobFee = 4000;
          } else {
            dobFee = 2000;
          }
        }
      } catch { }
    }
    
    return { totalFee: baseFee + dobFee, dobFee, dobError };
  }, [serviceId, bankType, oldDob, newDob, prices]);

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    
    if (dobError) {
      setSubmitError(dobError);
      return;
    }
    
    setIsConfirmModalOpen(true);
  };
  
  // --- This is the *final* submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    let formData: any = { bvn, nin, email, password };
    
    if (serviceId === 'BVN_MOD_NAME') {
      formData = { ...formData, newFirstName, newMiddleName, newLastName };
    } else if (serviceId === 'BVN_MOD_DOB') {
      formData = { ...formData, fullName, oldDob, newDob };
    } else if (serviceId === 'BVN_MOD_PHONE') {
      formData = { ...formData, fullName, newPhone };
    } else if (serviceId === 'BVN_MOD_NAME_DOB') {
      formData = { ...formData, newFirstName, newMiddleName, newLastName, oldDob, newDob };
    } else if (serviceId === 'BVN_MOD_NAME_PHONE') {
      formData = { ...formData, newFirstName, newMiddleName, newLastName, newPhone };
    } else if (serviceId === 'BVN_MOD_DOB_PHONE') {
      formData = { ...formData, newPhone, oldDob, newDob };
    }

    try {
      const response = await fetch('/api/services/bvn/modification-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceId, 
          bankType: bankType,
          formData, 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message);
      // Reset the form
      setServiceId(null); setBankType(null);
      setBvn(''); setNin(''); setEmail(''); setPassword('');
      setNewFirstName(''); setNewLastName(''); setNewMiddleName('');
      setOldDob(''); setNewDob(''); setFullName(''); setNewPhone('');
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
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 mb-6">
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
                  <Link href="/dashboard/history/bvn" className="font-semibold underline hover:text-blue-600">
                    BVN History
                  </Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          {/* --- Step 1: Select Institution --- */}
          {!bankType && (
            <div>
              <label className="text-lg font-semibold text-gray-900">
                1. Select Enrollment Institution
              </label>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                {banksList.map(bank => (
                  <ModTypeButton
                    key={bank}
                    title={bank}
                    description="Enrollment Bank"
                    selected={false}
                    onClick={() => setBankType(bank)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* --- Step 2: Select Mod Type --- */}
          {bankType && !serviceId && (
            <div className="space-y-6">
              {/* Summary of Step 1 */}
              <div className="pb-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-500">Selected Institution</label>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-900">{bankType}</p>
                  <button
                    type="button"
                    onClick={() => { setBankType(null); setServiceId(null); }}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Change
                  </button>
                </div>
              </div>
              
              <label className="text-lg font-semibold text-gray-900">
                2. Select Modification Type
              </label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                {modTypes.map(mod => (
                  <ModTypeButton
                    key={mod.id}
                    title={mod.name}
                    description={`Fee: ₦${prices[mod.id] || 'N/A'}`}
                    selected={false}
                    onClick={() => setServiceId(mod.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* --- Step 3: Enter Details --- */}
          {bankType && serviceId && (
            <div className="space-y-6">
              {/* Summary of Steps 1 & 2 */}
              <div className="pb-4 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-500">Institution</label>
                  <button
                    type="button"
                    onClick={() => { setBankType(null); setServiceId(null); }}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Change
                  </button>
                </div>
                <p className="text-lg font-semibold text-gray-900 -mt-2">{bankType}</p>
              </div>
              
              <div className="pb-4 border-b border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-500">Modification Type</label>
                  <button
                    type="button"
                    onClick={() => setServiceId(null)}
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Change
                  </button>
                </div>
                <p className="text-lg font-semibold text-gray-900 -mt-2">
                  {modTypes.find(m => m.id === serviceId)?.name}
                </p>
              </div>
              
              {/* Conditional Form Fields */}
              <div className="pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">3. Enter Required Details</h3>
                
                <DataInput label="BVN Number*" id="bvn" value={bvn} onChange={setBvn} Icon={IdentificationIcon} />
                <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} />
                
                {serviceId.includes('NAME') && (
                  <fieldset className="rounded-lg border border-gray-300 p-4">
                    <legend className="text-sm font-medium text-gray-700 px-2">New Name Details</legend>
                    <div className="space-y-4">
                      <DataInput label="New First Name*" id="new-fname" value={newFirstName} onChange={setNewFirstName} Icon={UserIcon} />
                      <DataInput label="New Last Name*" id="new-lname" value={newLastName} onChange={setNewLastName} Icon={UserIcon} />
                      <DataInput label="New Middle Name (Optional)" id="new-mname" value={newMiddleName} onChange={setNewMiddleName} Icon={UserIcon} isRequired={false} />
                    </div>
                  </fieldset>
                )}
                {serviceId === 'BVN_MOD_NAME' && (
                 <p className="text-sm text-gray-600">
                   For Female Change of Surname, Newspaper is Compulsory. 
                   <Link href="/dashboard/services/newspaper" className="font-medium text-blue-600 hover:underline">
                     Need one? Get one from us.
                   </Link>
                 </p>
                )}
                
                {serviceId.includes('DOB') && (
                  <fieldset className="rounded-lg border border-gray-300 p-4">
                    <legend className="text-sm font-medium text-gray-700 px-2">DOB Details</legend>
                    <div className="space-y-4">
                      {!serviceId.includes('NAME') && <DataInput label="Full Name*" id="fullName" value={fullName} onChange={setFullName} Icon={UserIcon} />}
                      <DataInput label="Old DOB*" id="oldDob" value={oldDob} onChange={setOldDob} Icon={CalendarDaysIcon} type="date" />
                      <DataInput label="New DOB*" id="newDob" value={newDob} onChange={setNewDob} Icon={CalendarDaysIcon} type="date" />
                    </div>
                  </fieldset>
                )}
                
                {serviceId.includes('PHONE') && (
                  <fieldset className="rounded-lg border border-gray-300 p-4">
                    <legend className="text-sm font-medium text-gray-700 px-2">Phone Details</legend>
                    <div className="space-y-4">
                      {!serviceId.includes('NAME') && !serviceId.includes('DOB') && <DataInput label="Full Name*" id="fullName" value={fullName} onChange={setFullName} Icon={UserIcon} />}
                      <DataInput label="New Phone Number*" id="newPhone" value={newPhone} onChange={setNewPhone} Icon={PhoneIcon} type="tel" maxLength={11} />
                    </div>
                  </fieldset>
                )}
                
                {dobError && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <p className="text-sm font-bold text-red-800">{dobError}</p>
                  </div>
                )}
                {dobFee > 0 && (
                  <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
                    <p className="text-sm font-bold text-yellow-800">An additional fee of ₦{dobFee} applies for DOB changes over 5 years.</p>
                  </div>
                )}
                
                <fieldset className="rounded-lg border border-gray-300 p-4">
                  <legend className="text-sm font-medium text-gray-700 px-2">Login Details</legend>
                  <div className="space-y-4">
                    <DataInput label="New Valid Fresh Email*" id="email" value={email} onChange={setEmail} Icon={EnvelopeIcon} type="email" />
                    <DataInput label="Email Password*" id="password" value={password} onChange={setPassword} Icon={LockClosedIcon} type="password" />
                  </div>
                </fieldset>
              </div>
           )}   
          
            {/* --- Submit Button --- */}
            {serviceId && (
              <div className="border-t border-gray-200 pt-6">
                {submitError && !dobError && (
                  <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !!dobError}
                  className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${totalFee})`}
                </button>
              </div>
            )}
          
        </form>
      </div>

      {/* --- Terms Modal --- */}
      {isTermsModalOpen && (
        <BvnModificationTermsModal onClose={() => setIsTermsModalOpen(false)} />
      )}

      {/* --- Confirmation Modal --- */}
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
                Total Fee: ₦{totalFee}
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
