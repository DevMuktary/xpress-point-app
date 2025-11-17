"use client"; // This is an interactive component

import React, { useState } from 'react';
import { 
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarDaysIcon // <-- THIS IS THE FIX
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- Type Definitions ---
type Props = {
  serviceId: string;
  serviceName: string;
  serviceFee: number;
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
export default function TinClientPage({ serviceId, serviceName, serviceFee }: Props) {
  
  // --- State Management ---
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data State ---
  const [companyName, setCompanyName] = useState('');
  const [rcNumber, setRcNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [commencementDate, setCommencementDate] = useState('');

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setReceipt(null);
    setIsConfirmModalOpen(true);
  };
  
  // --- This is the *final* submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    // Consolidate all form data
    const formData: any = {
      ownerName,
      ownerPhone,
      ownerEmail,
    };

    if (serviceId.includes('REG')) {
      formData.companyName = companyName;
      formData.rcNumber = rcNumber || 'N/A';
      formData.commencementDate = commencementDate;
    } else {
      // For Retrieval
      formData.companyName = companyName;
      formData.rcNumber = rcNumber;
    }

    try {
      const response = await fetch('/api/services/tin/submit', {
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
      
      setReceipt({
        message: data.message,
        serviceName: serviceName,
        status: "PENDING",
      });
      
      // Reset the form
      setCompanyName(''); setRcNumber(''); setOwnerName('');
      setOwnerPhone(''); setOwnerEmail(''); setCommencementDate('');

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeReceiptModal = () => {
    setReceipt(null);
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          <h3 className="text-lg font-semibold text-gray-900">Enter Request Details</h3>
          
          {/* Conditional Fields */}
          <div className="space-y-4">
            <DataInput label="Company / Business Name*" id="companyName" value={companyName} onChange={setCompanyName} Icon={BriefcaseIcon} />
            <DataInput 
              label={serviceId.includes('REG') ? "RC/BN Number (if available)" : "RC/BN Number*"}
              id="rcNumber" 
              value={rcNumber} 
              onChange={setRcNumber} 
              Icon={IdentificationIcon} 
              isRequired={!serviceId.includes('REG')} 
            />
            {serviceId.includes('REG') && (
              <DataInput label="Business Commencement Date*" id="commencementDate" value={commencementDate} onChange={setCommencementDate} Icon={CalendarDaysIcon} type="date" />
            )}
          </div>
          
          <fieldset className="rounded-lg border border-gray-300 p-4">
            <legend className="text-sm font-medium text-gray-700 px-2">Owner/Proprietor Details</legend>
            <div className="space-y-4">
              <DataInput label="Owner's Full Name*" id="ownerName" value={ownerName} onChange={setOwnerName} Icon={UserIcon} />
              <DataInput label="Owner's Phone Number*" id="ownerPhone" value={ownerPhone} onChange={setOwnerPhone} Icon={PhoneIcon} type="tel" />
              <DataInput label="Owner's Email*" id="ownerEmail" value={ownerEmail} onChange={setOwnerEmail} Icon={EnvelopeIcon} type="email" />
            </div>
          </fieldset>
          
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
              {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${serviceFee})`}
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
                Total Fee: ₦{serviceFee}
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

      {/* --- Success Modal (Receipt) --- */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex flex-col items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  Request Submitted
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {receipt.message}
                </p>
                
                <div className="w-full mt-6 space-y-2 rounded-lg border bg-gray-50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Service:</span>
                    <span className="text-sm font-semibold text-gray-900">{receipt.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className="text-sm font-semibold text-yellow-600">{receipt.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">Amount:</span>
                    <span className="text-sm font-semibold text-gray-900">₦{serviceFee}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <Link
                href="/dashboard/history/tin" // We will create this history page later
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 text-center transition-colors hover:bg-gray-100"
              >
                Check History
              </Link>
              <button
                onClick={closeReceiptModal}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Submit Another
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
