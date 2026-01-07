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
  PhotoIcon,         // Icon for the "View Sample" button
  EyeIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';
import Image from 'next/image';

// --- Props Definition ---
type Props = {
  prices: Record<string, number>; 
  availability: Record<string, boolean>; 
};

// --- Helper Component: Selection Button with Sample Link ---
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
    className={`relative rounded-xl p-4 text-left transition-all border-2 cursor-pointer group
      ${disabled
        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
        : selected
          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500 shadow-md'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className={`font-bold text-lg ${disabled ? 'text-gray-400' : 'text-gray-900'}`}>{title}</p>
        <p className={`text-sm font-medium mt-1 ${disabled ? 'text-gray-400' : 'text-blue-600'}`}>
            {disabled ? 'Unavailable' : description}
        </p>
      </div>
      
      {/* View Sample Button (Stops propagation so it doesn't select the card) */}
      <button
        type="button"
        onClick={onViewSample}
        className="z-10 p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors shadow-sm"
        title="View Sample Image"
      >
        <PhotoIcon className="h-5 w-5" />
      </button>
    </div>
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

// --- Notification Component ---
const AnnouncementBox = () => (
  <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border border-blue-100 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-white p-1.5 shadow-sm">
        <MegaphoneIcon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-blue-900 text-sm">
          Transition to The Nigeria Revenue Service (NRS)
        </h3>
        <p className="text-xs text-blue-800 leading-relaxed">
          The old JTB-TIN Certificate is no longer issued. You will now receive a <strong>13-digit Tax ID</strong> and a digital slip.
        </p>
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

  // --- Handlers ---
  const handleOpenSample = (e: React.MouseEvent, src: string) => {
    e.stopPropagation(); // Prevent card selection when clicking "View Sample"
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
   
  // --- Final Submit ---
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
    <div className="space-y-6 max-w-4xl mx-auto">
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

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* --- COMPACT NOTIFICATION --- */}
        <AnnouncementBox />

        <form onSubmit={handleOpenConfirmModal} className="space-y-8">
          
          {/* 1. Category Selection with Embedded Sample Buttons */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModTypeButton
                  title="Personal Tax ID"
                  description={`Fee: ₦${prices[`TIN_REG_PERSONAL`]?.toLocaleString() || '...'}`}
                  selected={subType === 'PERSONAL'}
                  disabled={!availability[`TIN_REG_PERSONAL`]} 
                  onClick={() => setSubType('PERSONAL')}
                  onViewSample={(e) => handleOpenSample(e, '/examples/personal_tax_example.jpg')}
              />
              <ModTypeButton
                  title="Non-Individual Tax ID"
                  description={`Fee: ₦${prices[`TIN_REG_BUSINESS`]?.toLocaleString() || '...'}`}
                  selected={subType === 'BUSINESS'}
                  disabled={!availability[`TIN_REG_BUSINESS`]}
                  onClick={() => setSubType('BUSINESS')}
                  onViewSample={(e) => handleOpenSample(e, '/examples/business_tax_example.jpg')}
              />
            </div>
          </div>

          {/* 2. Form Fields (Appears without scrolling too much) */}
          {subType && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300 border-t border-gray-100 pt-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {subType === 'PERSONAL' ? <UserIcon className="h-5 w-5 text-gray-500" /> : <BriefcaseIcon className="h-5 w-5 text-gray-500" />}
                Enter {subType === 'PERSONAL' ? 'Personal' : 'Business'} Details
              </h3>
              
              {/* === PERSONAL === */}
              {subType === 'PERSONAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} type="tel" />
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
                Please double-check your details. This action cannot be reversed.
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

      {/* --- CONFIRMATION MODAL --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                <CheckCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Submission</h3>
              <p className="text-gray-500 mt-2 text-sm">
                Are you sure the details provided are correct?
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

      {/* --- LIGHTBOX MODAL (Full Screen Image) --- */}
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
                <p className="text-center text-white mt-4 text-sm font-medium">Click outside to close</p>
            </div>
        </div>
      )}
    </div>
  );
}
