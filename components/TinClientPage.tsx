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

// --- Helper Component: Selection Button ---
const ModTypeButton = ({ title, description, selected, onClick, disabled = false }: {
  title: string, description: string, selected: boolean, onClick: () => void, disabled?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg p-4 text-left transition-all border-2 w-full
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  </div>
);

// --- Notification Component ---
const AnnouncementBox = () => (
  <div className="mb-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border border-blue-100 animate-in fade-in slide-in-from-top-2">
    <div className="flex items-start gap-4">
      <div className="rounded-full bg-blue-100 p-2">
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
          <p>
            <span className="font-bold text-red-600">Note:</span> The old JTB-TIN Certificate is no longer issued. 
            You will now receive a <strong>13-digit Tax ID</strong> and a digital image slip containing your details. 
            This applies to both Individuals and Corporate entities.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// --- Example Preview Component ---
const ExamplePreview = ({ onPreview }: { onPreview: (src: string) => void }) => (
    <div className="mt-4 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Example */}
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                Personal Tax ID Example
            </div>
            <div className="p-4 flex flex-col items-center justify-center min-h-[200px] relative group cursor-pointer" onClick={() => onPreview('/examples/personal_tax_example.jpg')}>
                <div className="relative w-full h-[250px]">
                    <Image 
                      src="/examples/personal_tax_example.jpg" 
                      alt="Personal Tax ID Sample"
                      fill
                      className="object-contain rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg">
                    <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 transition-opacity">
                        <MagnifyingGlassPlusIcon className="h-4 w-4" /> Click to Enlarge
                    </span>
                </div>
            </div>
        </div>

        {/* Business Example */}
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                Company Tax ID Example
            </div>
            <div className="p-4 flex flex-col items-center justify-center min-h-[200px] relative group cursor-pointer" onClick={() => onPreview('/examples/business_tax_example.jpg')}>
                <div className="relative w-full h-[250px]">
                    <Image 
                      src="/examples/business_tax_example.jpg" 
                      alt="Business Tax ID Sample"
                      fill
                      className="object-contain rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg">
                     <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 transition-opacity">
                        <MagnifyingGlassPlusIcon className="h-4 w-4" /> Click to Enlarge
                    </span>
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

  // Lightbox State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- Form Data States ---
  // Personal
  const [nin, setNin] = useState('');
  const [dob, setDob] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [surname, setSurname] = useState('');
  
  // Non-Individual
  const [bizName, setBizName] = useState('');
  const [rcNumber, setRcNumber] = useState('');

  // --- Dynamic Fee Calculation ---
  const { serviceId, fee } = useMemo(() => {
    let id = '';
    if (subType === 'PERSONAL') id = 'TIN_REG_PERSONAL'; 
    else if (subType === 'BUSINESS') id = 'TIN_REG_BUSINESS'; 
    
    return { serviceId: id, fee: prices[id] || 0 };
  }, [subType, prices]);

  // --- Step 1: Open Modal ---
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
   
  // --- Step 2: Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
     
    let formData: any = {};

    if (subType === 'PERSONAL') {
      formData = { nin, dob, firstName, middleName, surname };
    } else if (subType === 'BUSINESS') {
      formData = { bizName, rcNumber };
    }

    try {
      const response = await fetch('/api/services/tin/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          serviceId, 
          formData, 
          statusReportUrl: null 
        }),
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
    <div className="space-y-6">
      {(isSubmitting) && <Loading />}
      
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3">
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

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* --- NOTIFICATION BLOCK --- */}
        <AnnouncementBox />
        
        {/* --- EXAMPLE PREVIEW --- */}
        <ExamplePreview onPreview={setPreviewImage} />

        <form onSubmit={handleOpenConfirmModal} className="space-y-8">
          
          {/* 1. Category */}
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModTypeButton
                title="Personal Tax ID"
                description={`For Individuals (Fee: ₦${prices[`TIN_REG_PERSONAL`]?.toLocaleString() || '...'})`}
                selected={subType === 'PERSONAL'}
                disabled={!availability[`TIN_REG_PERSONAL`]} 
                onClick={() => setSubType('PERSONAL')}
            />
            <ModTypeButton
                title="Non-Individual Tax ID"
                description={`For Company/Biz Name (Fee: ₦${prices[`TIN_REG_BUSINESS`]?.toLocaleString() || '...'})`}
                selected={subType === 'BUSINESS'}
                disabled={!availability[`TIN_REG_BUSINESS`]}
                onClick={() => setSubType('BUSINESS')}
            />
            </div>
          </div>

          {/* 2. Form Fields */}
          {subType && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-gray-100 pt-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Enter Details</h3>
              
              {/* === PERSONAL === */}
              {subType === 'PERSONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataInput label="NIN*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} type="tel" />
                  <DataInput label="Date of Birth*" id="dob" value={dob} onChange={setDob} Icon={CalendarDaysIcon} type="date" />
                  
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataInput label="First Name*" id="fname" value={firstName} onChange={setFirstName} Icon={UserIcon} />
                    <DataInput label="Middle Name" id="mname" value={middleName} onChange={setMiddleName} Icon={UserIcon} isRequired={false} />
                    <DataInput label="Surname*" id="sname" value={surname} onChange={setSurname} Icon={UserIcon} />
                  </div>
                </div>
              )}

              {/* === BUSINESS === */}
              {subType === 'BUSINESS' && (
                <div className="space-y-4">
                  <DataInput label="Company/Business Name*" id="bizName" value={bizName} onChange={setBizName} Icon={BriefcaseIcon} />
                  <DataInput label="RC/BN Number*" id="rcNumber" value={rcNumber} onChange={setRcNumber} Icon={BuildingOfficeIcon} />
                </div>
              )}
            </div>
          )}
          
          {/* 3. Submit Button */}
          {subType && (
            <div className="pt-6 border-t border-gray-100">
              <p className="text-sm font-medium text-red-600 text-center mb-4 bg-red-50 p-2 rounded">
                Please confirm details are correct. This action is irreversible.
              </p>

              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : `Submit Request (₦${fee.toLocaleString()})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Submission</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Please verify all details.
              </p>
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-600 font-medium">Total Charge</p>
                <p className="text-2xl font-bold text-blue-700">₦{fee.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-gray-100">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
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

      {/* --- LIGHTBOX MODAL --- */}
      {previewImage && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setPreviewImage(null)} // Click background to close
        >
            <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setPreviewImage(null)}
                    className="absolute -top-12 right-0 md:-right-12 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                >
                    <XMarkIcon className="h-8 w-8" />
                </button>
                <div className="relative w-full h-[80vh] rounded-lg overflow-hidden shadow-2xl">
                    <Image 
                        src={previewImage}
                        alt="Enlarged Preview"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
