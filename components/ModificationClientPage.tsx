"use client"; // This is an interactive component

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ExclamationTriangleIcon, 
  IdentificationIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  LockClosedIcon,
  HomeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// Define the props to receive the initial data from the server
type Props = {
  hasAlreadyAgreed: boolean;
};

// Define the "modern button" types
type ModType = 'NAME' | 'PHONE' | 'ADDRESS';

// --- The "World-Class" Consent Text (Refurbished) ---
const ConsentText = () => (
  <div className="space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
    <p>Before you proceed, you must read and agree to the following terms. This is a one-time agreement.</p>
    
    <h4 className="font-bold text-gray-900">1. Authorization to Act on Your Behalf</h4>
    <p>I, the user, authorize Xpress Point and its trusted agents to access and use my personal data, including my NIN, to process the modification requested. I understand that Xpress Point is an independent agent and is <strong className="font-semibold">not</strong> affiliated with NIMC.</p>
    
    <h4 className="font-bold text-gray-900">2. Your Voluntary Consent</h4>
    <p>NIMC recommends that NIN modifications be done personally. By agreeing, I confirm that due to technical difficulty, illiteracy, or convenience, I <strong className="font-semibold">voluntarily authorize</strong> Xpress Point to perform this modification on my behalf. This applies whether I am the NIN owner or an agent acting with the full consent of the owner.</p>
    
    <h4 className="font-bold text-gray-900">3. Service Fees & No-Refund Policy</h4>
    <p>I agree to pay the non-refundable service fee. I understand that wallet funds are <strong className="font-semibold">non-withdrawable</strong>. If a service fails due to an API or provider error (as specified in our auto-refund logic), the fee will be credited to my wallet, but it cannot be withdrawn.</p>
    
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
    </ul>
    
    <p>I have read, understood, and agree to all the terms above. I authorize Xpress Point to proceed with my NIN modification.</p>
  </div>
);

// --- The "Modern Button" Component ---
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
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

// --- The Main "World-Class" Component ---
export default function ModificationClientPage({ hasAlreadyAgreed }: Props) {
  const router = useRouter();
  
  // --- State Management ---
  const [hasAgreed, setHasAgreed] = useState(hasAlreadyAgreed);
  const [modType, setModType] = useState<ModType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Your "Sweet Alert" message
  
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

  // --- API 1: Handle Agreeing to Terms ---
  const handleAgree = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/agree-mod-terms', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to save agreement.');
      setHasAgreed(true); // "World-class" - now show the form
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API 2: Handle Form Submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
    } else {
      setError("Please select a modification type.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/services/nin/modification-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, formData }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      // Your "Sweet Alert" - style message
      setSuccess(data.message);
      // Reset the form
      setNin(''); setPhone(''); setEmail(''); setPassword('');
      setFirstName(''); setLastName(''); setMiddleName('');
      setNewPhone(''); setAddress(''); setState(''); setLga('');
      setModType(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- This is the "Refurbished" Consent Form ---
  if (!hasAgreed) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        {isLoading && <Loading />}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Authorization Agreement</h2>
        
        <ConsentText />
        
        {error && (
          <p className="mt-4 text-sm font-medium text-red-600">{error}</p>
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
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            I AGREED
          </button>
        </div>
      </div>
    );
  }

  // --- This is the "World-Class" Submission Form ---
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
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
                Refund is only in some certain circumstances and if that happens, 
                they’ll be automatically refunded.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
                  You can monitor the status of your request on the
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
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- "Modern Buttons" for Mod Type --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Modification Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <ModTypeButton
                title="Change of Name"
                description="Fee: ₦2000"
                selected={modType === 'NAME'}
                onClick={() => setModType('NAME')}
              />
              <ModTypeButton
                title="Change of Phone"
                description="Fee: ₦1000"
                selected={modType === 'PHONE'}
                onClick={() => setModType('PHONE')}
              />
              <ModTypeButton
                title="Change of Address"
                description="Fee: ₦1500"
                selected={modType === 'ADDRESS'}
                onClick={() => setModType('ADDRESS')}
              />
            </div>
          </div>

          {/* --- Common Fields --- */}
          {modType && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              {/* NIN */}
              <div>
                <label htmlFor="nin" className="block text-sm font-medium text-gray-700">NIN Number*</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <IdentificationIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="nin" type="tel" value={nin}
                    onChange={(e) => setNin(e.target.value)}
                    maxLength={11}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* --- Conditional Fields --- */}
              {modType === 'NAME' && (
                <>
                  <DataInput label="New First Name*" id="fname" value={firstName} onChange={setFirstName} Icon={UserIcon} />
                  <DataInput label="New Last Name*" id="lname" value={lastName} onChange={setLastName} Icon={UserIcon} />
                  <DataInput label="New Middle Name (Optional)" id="mname" value={middleName} onChange={setMiddleName} Icon={UserIcon} />
                </>
              )}
              {modType === 'PHONE' && (
                <DataInput label="New Phone Number*" id="newphone" value={newPhone} onChange={setNewPhone} Icon={PhoneIcon} type="tel" />
              )}
              {modType === 'ADDRESS' && (
                <>
                  <DataInput label="New Address*" id="address" value={address} onChange={setAddress} Icon={HomeIcon} />
                  <DataInput label="State*" id="state" value={state} onChange={setState} Icon={MapPinIcon} />
                  <DataInput label="LGA*" id="lga" value={lga} onChange={setLga} Icon={MapPinIcon} />
                </>
              )}

              {/* --- Your Required Email/Password Fields --- */}
              <DataInput label="Your Current Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" />
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
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Modification Request'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// --- "World-Class" Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text" }: {
  label: string,
  id: string,
  value: string,
  onChange: (value: string) => void,
  Icon: React.ElementType,
  type?: string
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
        required
      />
    </div>
  </div>
);
