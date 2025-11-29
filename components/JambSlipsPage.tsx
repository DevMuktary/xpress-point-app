"use client"; 

import React, { useState, useMemo } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ChevronLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';

// --- Types ---
type Props = {
  prices: Record<string, number>; 
  availability: Record<string, boolean>; // <--- ADDED THIS
};

type SlipType = 'JAMB_RESULT_SLIP' | 'JAMB_REG_SLIP' | 'JAMB_ADMISSION_LETTER';

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

// --- Reusable Input Component ---
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired}
        placeholder={placeholder}
      />
    </div>
  </div>
);

// --- Notification Component ---
const NoticeBox = () => (
  <div className="mb-6 rounded-xl bg-blue-50 p-4 border border-blue-100 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-3">
      <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-800">
        <span className="font-bold block mb-1">Processing Time</span>
        You will get your Slip within 24 Working Hours.
      </div>
    </div>
  </div>
);

// --- The Main Component ---
export default function JambSlipsPage({ prices, availability }: Props) {
   
  const [serviceId, setServiceId] = useState<SlipType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // --- Form Data State ---
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [year, setYear] = useState('');

  // --- Dynamic Fee Calculation ---
  const fee = useMemo(() => {
    if (serviceId) {
      return prices[serviceId] || 0;
    }
    return 0;
  }, [serviceId, prices]);

  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!serviceId) {
      setSubmitError("Please select a slip type.");
      return;
    }
    setIsConfirmModalOpen(true);
  };
   
  // --- Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    
    const formData = { fullName, regNumber, year };

    try {
      const response = await fetch('/api/services/jamb/submit', {
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
      setServiceId(null);
      setFullName('');
      setRegNumber('');
      setYear('');

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Year options ---
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2014 }, (_, i) => currentYear - i);

   
  return (
    <div className="w-full max-w-3xl mx-auto">
      {(isSubmitting) && <Loading />}
      
      {/* --- Page Header --- */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services/jamb" className="text-gray-500 hover:text-gray-900">
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>
        <SafeImage
          src="/logos/jamb.png"
          alt="JAMB Logo"
          width={40}
          height={40}
          fallbackSrc="/logos/default.png"
          className="rounded-full"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          JAMB Slip Printing
        </h1>
      </div>

      {/* --- Success Message --- */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 mb-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-green-800">
                Request Submitted Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your request is now <strong className="font-semibold">PENDING</strong>. You can monitor its status on the
                  <Link href="/dashboard/history/jamb" className="font-semibold underline hover:text-green-600 ml-1">
                    JAMB History
                  </Link> page.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- The "Submit New Request" Form --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* --- NOTIFICATION BLOCK --- */}
        <NoticeBox />
        {/* -------------------------- */}

        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          {/* --- Service Selection --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Slip Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <ModTypeButton
                title="Original Result Slip"
                description={`Fee: ₦${prices.JAMB_RESULT_SLIP?.toLocaleString() || '...'}`}
                selected={serviceId === 'JAMB_RESULT_SLIP'}
                disabled={!availability['JAMB_RESULT_SLIP']} // <--- Apply Check
                onClick={() => setServiceId('JAMB_RESULT_SLIP')}
              />
              <ModTypeButton
                title="Registration Slip"
                description={`Fee: ₦${prices.JAMB_REG_SLIP?.toLocaleString() || '...'}`}
                selected={serviceId === 'JAMB_REG_SLIP'}
                disabled={!availability['JAMB_REG_SLIP']} // <--- Apply Check
                onClick={() => setServiceId('JAMB_REG_SLIP')}
              />
              <ModTypeButton
                title="Admission Letter"
                description={`Fee: ₦${prices.JAMB_ADMISSION_LETTER?.toLocaleString() || '...'}`}
                selected={serviceId === 'JAMB_ADMISSION_LETTER'}
                disabled={!availability['JAMB_ADMISSION_LETTER']} // <--- Apply Check
                onClick={() => setServiceId('JAMB_ADMISSION_LETTER')}
              />
            </div>
          </div>

          {/* --- Conditional Form Fields --- */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              
              <DataInput label="Full Name*" id="fullName" value={fullName} onChange={setFullName} Icon={UserIcon} />
              <DataInput label="Reg. Number or Profile Code*" id="regNum" value={regNumber} onChange={setRegNumber} Icon={IdentificationIcon} />
              
              {/* Year Selector */}
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">Select Year*</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Select Year --</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- Submit Button --- */}
              <div className="pt-6">
                {submitError && (
                  <p className="mb-4 text-sm font-medium text-red-600 text-center bg-red-50 p-2 rounded-lg">{submitError}</p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50 hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Submitting...' : `Submit Request (Fee: ₦${fee.toLocaleString()})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Please Confirm
              </h2>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600 text-sm">
                Please confirm you have filled in the right details. <br/>
                <strong>This action is irreversible.</strong>
              </p>
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-center text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-center text-2xl font-bold text-blue-700">₦{fee.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-0 border-t border-gray-200">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleFinalSubmit}
                className="py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
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
