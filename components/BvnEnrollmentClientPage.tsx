"use client"; // This is an interactive component

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  PhoneIcon,
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  HomeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Type Definitions ---
type Props = {
  fee: number;
};

// --- Reusable Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "" }: {
  label: string, id: string, value: string, onChange: (value: string) => void, Icon: React.ElementType, type?: string, isRequired?: boolean, placeholder?: string
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
        required={isRequired} placeholder={placeholder}
      />
    </div>
  </div>
);

// --- The Main Component ---
export default function BvnEnrollmentClientPage({ fee }: Props) {
  
  const serviceId = 'BVN_ENROLLMENT_ANDROID';
  
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data State (All fields) ---
  const [agentLocation, setAgentLocation] = useState('');
  const [agentBvn, setAgentBvn] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [altEmail, setAltEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [zone, setZone] = useState('');

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    setIsConfirmModalOpen(true);
  };
  
  // --- This is the *final* submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    // Consolidate all form data
    const formData = {
      agentLocation, agentBvn, bankName, accountName,
      firstName, lastName, dob, email, altEmail,
      phone, altPhone, address, state, lga, zone
    };

    try {
      const response = await fetch('/api/services/bvn/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId: serviceId, 
          formData, 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message);
      // Reset the form
      setAgentLocation(''); setAgentBvn(''); setBankName(''); setAccountName('');
      setFirstName(''); setLastName(''); setDob(''); setEmail(''); setAltEmail('');
      setPhone(''); setAltPhone(''); setAddress(''); setState(''); setLga(''); setZone('');

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
                <p className="mt-2">
                  To check enrollment reports, visit: 
                  <a href="https://agency.xpresspoint.net" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                    agency.xpresspoint.net
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Enter Enrollment Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataInput label="Agent Location*" id="agentLocation" value={agentLocation} onChange={setAgentLocation} Icon={MapPinIcon} />
            <DataInput label="Agent BVN*" id="agentBvn" value={agentBvn} onChange={setAgentBvn} Icon={IdentificationIcon} />
            <DataInput label="Bank Name*" id="bankName" value={bankName} onChange={setBankName} Icon={BuildingOfficeIcon} />
            <DataInput label="Account Name*" id="accountName" value={accountName} onChange={setAccountName} Icon={UserIcon} />
            <DataInput label="First Name*" id="firstName" value={firstName} onChange={setFirstName} Icon={UserIcon} />
            <DataInput label="Last Name*" id="lastName" value={lastName} onChange={setLastName} Icon={UserIcon} />
            <DataInput label="Date of Birth*" id="dob" value={dob} onChange={setDob} Icon={CalendarDaysIcon} type="date" />
            <DataInput label="Email*" id="email" value={email} onChange={setEmail} Icon={EnvelopeIcon} type="email" />
            <DataInput label="Alternative Email*" id="altEmail" value={altEmail} onChange={setAltEmail} Icon={EnvelopeIcon} type="email" />
            <DataInput label="Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" />
            <DataInput label="Alternative Phone Number*" id="altPhone" value={altPhone} onChange={setAltPhone} Icon={PhoneIcon} type="tel" />
            <DataInput label="Residential Address*" id="address" value={address} onChange={setAddress} Icon={HomeIcon} />
            <DataInput label="State of Residence*" id="state" value={state} onChange={setState} Icon={MapPinIcon} />
            <DataInput label="LGA*" id="lga" value={lga} onChange={setLga} Icon={MapPinIcon} />
            <DataInput label="Geo-Political Zone*" id="zone" value={zone} onChange={setZone} Icon={MapPinIcon} />
          </div>
          
          {/* --- Submit Button --- */}
          <div className="border-t border-gray-200 pt-6">
            {submitError && (
              <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : `Submit Enrollment (Fee: ₦${fee})`}
            </button>
          </div>
        </form>
      </div>

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
