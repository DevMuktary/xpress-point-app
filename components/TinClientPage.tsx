"use client"; 

import React, { useState, useMemo } from 'react';
import { 
  CheckCircleIcon,
  UserIcon,
  IdentificationIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  MegaphoneIcon,
  XMarkIcon,
  PhotoIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import Image from 'next/image';

// --- Props Definition ---
type Props = {
  prices: Record<string, number>; 
  availability: Record<string, boolean>; 
};

// --- Helper Component: Selection Card with "View Sample" ---
const ModTypeButton = ({ 
  title, 
  description, 
  selected, 
  onClick, 
  onViewSample, 
  disabled = false 
}: {
  title: string, 
  description: string, 
  selected: boolean, 
  onClick: () => void, 
  onViewSample: (e: React.MouseEvent) => void,
  disabled?: boolean
}) => (
  <div 
    onClick={!disabled ? onClick : undefined}
    className={`relative flex flex-col justify-between rounded-xl p-5 text-left transition-all border-2 cursor-pointer group h-full
      ${disabled
        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
        : selected
          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
      }`}
  >
    <div>
      <h3 className={`font-bold text-lg ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm font-medium mt-1 mb-4 ${disabled ? 'text-gray-400' : 'text-blue-600'}`}>
          {disabled ? 'Unavailable' : description}
      </p>
    </div>
    
    {/* "View Sample" Action - Clearly Written */}
    <div className="pt-3 border-t border-gray-100/50 mt-auto">
      <button
        type="button"
        onClick={onViewSample}
        className="text-xs font-bold uppercase tracking-wide text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-blue-100/50 w-fit"
      >
        <PhotoIcon className="h-4 w-4" />
        View Sample
      </button>
    </div>

    {/* Selected Indicator Checkmark */}
    {selected && (
      <div className="absolute top-4 right-4">
        <CheckCircleIcon className="h-6 w-6 text-blue-600" />
      </div>
    )}
  </div>
);

// --- Helper Component: Input Field ---
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
      />
    </div>
  </div>
);

// --- Notification Component (Restored Detailed Version) ---
const AnnouncementBox = () => (
  <div className="mb-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-4">
      <div className="rounded-full bg-blue-100 p-2 shadow-sm">
        <MegaphoneIcon className="h-6 w-6 text-blue-700" />
      </div>
      <div className="space-y-3">
        <h3 className="font-bold text-blue-900 text-lg">
          Important Update: Transition to The Nigeria Revenue Service
        </h3>
        <div className="text-sm text-blue-800 space-y-2 leading-relaxed">
          <p>
            Please be informed that the Federal Inland Revenue Service has transitioned to 
            <strong> The Nigeria Revenue Service (NRS)</strong>.
          </p>
          <div className="bg-white/60 p-3 rounded-lg border border-blue-100/50">
            <p className="flex gap-2">
              <span className="font-bold text-red-600 shrink-0">Note:</span> 
              <span>
                The old JTB-TIN Certificate is no longer issued. 
                You will now receive a <strong>13-digit Tax ID</strong> and a digital image slip containing your details. 
                This applies to both Individuals and Corporate entities.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function TinClientPage({ prices, availability }: Props) {
   
  // --- State Management ---
  const [subType, setSubType] = useState<'PERSONAL' | 'BUSINESS' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- Form Data States ---
  const [nin, setNin] = useState('');
  const [dob, setDob] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  
  const [bizName, setBizName] = useState('');
  const [rcNumber, setRcNumber] = useState('');

  // --- Dynamic Fee Calculation ---
  const { serviceId, fee } = useMemo(() => {
    let id = '';
    if (subType === 'PERSONAL') id = 'TIN_REG_PERSONAL'; 
    else if (subType === 'BUSINESS') id = 'TIN_REG_BUSINESS'; 
    return { serviceId: id, fee: prices[id] || 0 };
  }, [subType, prices]);

  // --- Handlers ---
  const handleOpenSample = (e: React.MouseEvent, src: string) => {
    e.stopPropagation(); 
    setPreviewImage(src);
  };

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!serviceId) {
      setSubmitError("Please select a category.");
      return;
    }
    setIsConfirmModalOpen(true);
  };
   
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
     
    let formData: any = {};
    if (subType === 'PERSONAL') formData = { nin, dob, firstName, middleName, surname };
    else if (subType === 'BUSINESS') formData = { bizName, rcNumber };

    try {
      const response = await fetch('/api/services/tin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, formData, statusReportUrl: null }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      window.scrollTo(0, 0);

      // Reset Form
      setSubType(null);
      setNin(''); setDob(''); setFirstName(''); setMiddleName(''); setSurname('');
      setBizName(''); setRcNumber('');

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
   
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {(isSubmitting) && <Loading />}
      
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3 animate-in slide-in-from-top-2">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-green-800">Success!</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
            <Link href="/dashboard/history/tin" className="text-sm font-semibold underline text-green-800 mt-2 block">
              View History
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
        
        {/* --- DETAILED NOTIFICATION --- */}
        <AnnouncementBox />

        <form onSubmit={handleOpenConfirmModal} className="space-y-8">
          
          {/* 1. Category Selection Cards */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ModTypeButton
                  title="Personal Tax ID"
                  description={`Individual Request (Fee: ₦${prices[`TIN_REG_PERSONAL`]?.toLocaleString() || '...'})`}
                  selected={subType === 'PERSONAL'}
                  disabled={!availability[`TIN_REG_PERSONAL`]} 
                  onClick={() => setSubType('PERSONAL')}
                  onViewSample={(e) => handleOpenSample(e, '/examples/personal_tax_example.jpg')}
              />
              <ModTypeButton
                  title="Non-Individual Tax ID"
                  description={`Company/Biz Request (Fee: ₦${prices[`TIN_REG_BUSINESS`]?.toLocaleString() || '...'})`}
                  selected={subType === 'BUSINESS'}
                  disabled={!availability[`TIN_REG_BUSINESS`]}
                  onClick={() => setSubType('BUSINESS')}
                  onViewSample={(e) => handleOpenSample(e, '/examples/business_tax_example.jpg')}
              />
            </div>
          </div>

          {/* 2. Form Fields */}
          {subType && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-gray-100 pt-8 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                   {subType === 'PERSONAL' ? <UserIcon className="h-6 w-6 text-blue-600" /> : <BriefcaseIcon className="h-6 w-6 text-blue-600" />}
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Enter {subType === 'PERSONAL' ? 'Personal' : 'Business'} Details
                </h3>
              </div>
              
              {/* === PERSONAL === */}
              {subType === 'PERSONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} type="tel" />
                  <DataInput label="Date of Birth*" id="dob" value={dob} onChange={setDob} Icon={CalendarDaysIcon} type="date" />
                  
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DataInput label="First Name*" id="fname" value={firstName} onChange={setFirstName} Icon={UserIcon} />
                    <DataInput label="Middle Name" id="mname" value={middleName} onChange={setMiddleName} Icon={UserIcon} isRequired={false} />
                    <DataInput label="Surname*" id="sname" value={surname} onChange={setSurname} Icon={UserIcon} />
                  </div>
                </div>
              )}

              {/* === BUSINESS === */}
              {subType === 'BUSINESS' && (
                <div className="space-y-6 max-w-2xl">
                  <DataInput label="Company/Business Name*" id="bizName" value={bizName} onChange={setBizName} Icon={BriefcaseIcon} />
                  <DataInput label="RC/BN Number*" id="rcNumber" value={rcNumber} onChange={setRcNumber} Icon={BuildingOfficeIcon} />
                </div>
              )}
            </div>
          )}
          
          {/* 3. Submit Button */}
          {subType && (
            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm font-medium text-red-600 text-center mb-4 bg-red-50 p-3 rounded-lg max-w-md mx-auto">
                <span className="font-bold">Warning:</span> Please double-check your details. This action cannot be reversed.
              </p>

              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 text-lg"
              >
                {isSubmitting ? 'Submitting Request...' : `Submit Request (₦${fee.toLocaleString()})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Submission</h3>
              <p className="text-gray-500 mt-2 text-sm px-4">
                Are you sure the details provided are correct?
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 mx-2">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">Total Charge</p>
                <p className="text-3xl font-extrabold text-blue-700 mt-1">₦{fee.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-100">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-100"
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

      {/* --- LIGHTBOX MODAL (Full Screen Image) --- */}
      {previewImage && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
            onClick={() => setPreviewImage(null)}
        >
            <div className="relative max-w-5xl max-h-[95vh] w-full" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-12 right-0 md:-right-4 p-2 bg-white/10 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                    <XMarkIcon className="h-8 w-8" />
                </button>
                <div className="relative w-full h-[85vh] rounded-lg overflow-hidden shadow-2xl bg-black">
                    <Image 
                        src={previewImage}
                        alt="Enlarged Preview"
                        fill
                        className="object-contain"
                        quality={100}
                    />
                </div>
                <div className="flex justify-center mt-4">
                    <span className="text-white/70 text-sm bg-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
                        Click outside to close
                    </span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
