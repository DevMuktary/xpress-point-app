"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  UserIcon,
  InformationCircleIcon
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

// --- Notification Component ---
const NoticeBox = () => (
  <div className="mb-6 rounded-xl bg-blue-50 p-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-3">
      <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <span className="font-bold block mb-1">Processing Time</span>
        This Service will be Completed within 48 to 72 working hours.
      </div>
    </div>
  </div>
);

// --- The Main Component ---
export default function NewspaperClientPage() {
  const router = useRouter();
  
  // --- State Management ---
  const [modType, setModType] = useState<'NAME_CHANGE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); 
  const [hasAttested, setHasAttested] = useState(false); 
  
  // --- Form Data State (for Change of Name) ---
  const [oldFirstName, setOldFirstName] = useState('');
  const [oldLastName, setOldLastName] = useState('');
  const [oldMiddleName, setOldMiddleName] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newMiddleName, setNewMiddleName] = useState('');

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

    if (modType === 'NAME_CHANGE') {
      serviceId = 'NEWSPAPER_NAME_CHANGE';
      formData = { 
        oldFirstName, oldLastName, oldMiddleName,
        newFirstName, newLastName, newMiddleName
      };
    } else {
      setSubmitError("Please select a publication type.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/services/newspaper/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, formData }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Submission failed.');
      }
      
      setSuccess(data.message); 
      // Reset the form
      setOldFirstName(''); setOldLastName(''); setOldMiddleName('');
      setNewFirstName(''); setNewLastName(''); setNewMiddleName('');
      setHasAttested(false);
      setModType(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}
      
      {/* --- Success Message --- */}
      {success && (
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 animate-in fade-in slide-in-from-top-2">
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
                  <Link href="/dashboard/history/newspaper" className="font-semibold underline hover:text-blue-600 ml-1">
                    Newspaper History
                  </Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- Mod Type Selection --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Publication Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ModTypeButton
                title="Change of Name"
                description="Fee: ₦4500"
                selected={modType === 'NAME_CHANGE'}
                onClick={() => setModType('NAME_CHANGE')}
              />
            </div>
          </div>

          {/* --- Conditional Fields --- */}
          {modType === 'NAME_CHANGE' && (
            <div className="border-t border-gray-200 pt-6 space-y-6 animate-in fade-in slide-in-from-top-4">
              
              {/* --- NOTIFICATION BLOCK --- */}
              <NoticeBox />
              {/* -------------------------- */}

              <h3 className="text-lg font-semibold text-gray-900">2. Enter Publication Details</h3>
              
              {/* Old Names */}
              <fieldset className="rounded-lg border border-gray-300 p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">Old Names</legend>
                <div className="space-y-4">
                  <DataInput label="First Name*" id="old-fname" value={oldFirstName} onChange={setOldFirstName} Icon={UserIcon} />
                  <DataInput label="Last Name*" id="old-lname" value={oldLastName} onChange={setOldLastName} Icon={UserIcon} />
                  <DataInput label="Middle Name (Optional)" id="old-mname" value={oldMiddleName} onChange={setOldMiddleName} Icon={UserIcon} isRequired={false} />
                </div>
              </fieldset>

              {/* New Names */}
              <fieldset className="rounded-lg border border-gray-300 p-4">
                <legend className="text-sm font-medium text-gray-700 px-2">New Names</legend>
                <div className="space-y-4">
                  <DataInput label="First Name*" id="new-fname" value={newFirstName} onChange={setNewFirstName} Icon={UserIcon} />
                  <DataInput label="Last Name*" id="new-lname" value={newLastName} onChange={setNewLastName} Icon={UserIcon} />
                  <DataInput label="New Middle Name (Optional)" id="new-mname" value={newMiddleName} onChange={setNewMiddleName} Icon={UserIcon} isRequired={false} />
                </div>
              </fieldset>
              
              {/* --- Attestation --- */}
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
                    I attest that all the information and documents supplied for The Change of Name Publication are correct, valid, and accurate. I understand Xpress Point (https://xpresspoint.net) shall not be liable for any wrong information provided by me.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* --- Submit Button --- */}
          {modType && (
            <div className="border-t border-gray-200 pt-6">
              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !hasAttested}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Publication Request (Fee: ₦4500)'}
              </button>
            </div>
          )}
        </form>
      </div>
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
