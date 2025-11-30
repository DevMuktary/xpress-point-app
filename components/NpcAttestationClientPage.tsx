"use client";

import React, { useState } from 'react';
import { 
  UserIcon, MapPinIcon, BriefcaseIcon, AcademicCapIcon, 
  DocumentTextIcon, CheckCircleIcon, InformationCircleIcon, 
  ArrowPathIcon, IdentificationIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- State & LGA Data ---
const NIGERIA_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

// --- Reusable Input ---
const DataInput = ({ label, id, value, onChange, type = "text", isRequired = true, placeholder = "" }: any) => (
  <div className="col-span-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      id={id} type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-green-500 focus:ring-green-500"
      required={isRequired} placeholder={placeholder}
    />
  </div>
);

// --- Reusable Select ---
const DataSelect = ({ label, id, value, onChange, options }: any) => (
  <div className="col-span-1">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-green-500 focus:ring-green-500"
      required
    >
      <option value="">-- Select --</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const FileUpload = ({ label, id, file, onChange, isUploading }: any) => (
  <div className="col-span-2">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <input
        id={id} type="file" onChange={onChange} accept="image/png, image/jpeg, application/pdf" required
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />
      {isUploading && <ArrowPathIcon className="h-5 w-5 animate-spin text-green-600" />}
      {file && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
    </div>
  </div>
);

export default function NpcAttestationClientPage({ serviceFee }: { serviceFee: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // --- Form State ---
  const [formData, setFormData] = useState<any>({});
  
  // --- File State ---
  const [affidavitFile, setAffidavitFile] = useState<File | null>(null);
  const [affidavitUrl, setAffidavitUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAffidavitFile(file);
    setIsUploading(true);
    setAffidavitUrl(null);

    try {
      const data = new FormData();
      data.append('attestation', file);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAffidavitUrl(json.url);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    if (!affidavitUrl) {
      setSubmitError("Please wait for the Affidavit to finish uploading.");
      return;
    }

    if (!confirm(`Confirm submission? Fee: ₦${serviceFee.toLocaleString()}`)) return;

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/services/npc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          formData, 
          affidavitUrl 
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      window.scrollTo(0, 0);
      setFormData({});
      setAffidavitFile(null);
      setAffidavitUrl(null);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {isSubmitting && <Loading />}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3 animate-in fade-in">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-green-800">Success!</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
            <Link href="/dashboard" className="text-sm font-semibold underline text-green-800 mt-2 block">Return to Dashboard</Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        
        {/* Info Box */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-800 text-sm flex gap-3">
          <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Processing Time</p>
            <p>Certificate will be ready within 48-72 working hours.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Personal Info */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataInput label="Surname" id="surname" value={formData.surname || ''} onChange={(v: string) => handleChange('surname', v)} />
              <DataInput label="First Name" id="firstName" value={formData.firstName || ''} onChange={(v: string) => handleChange('firstName', v)} />
              <DataInput label="Middle Name" id="middleName" value={formData.middleName || ''} onChange={(v: string) => handleChange('middleName', v)} isRequired={false} />
              <DataSelect label="Sex" id="sex" value={formData.sex || ''} onChange={(v: string) => handleChange('sex', v)} options={['Male', 'Female']} />
              <DataInput label="Date of Birth" id="dob" type="date" value={formData.dob || ''} onChange={(v: string) => handleChange('dob', v)} />
              <DataSelect label="Marital Status" id="marital" value={formData.maritalStatus || ''} onChange={(v: string) => handleChange('maritalStatus', v)} options={['Single', 'Married', 'Divorced', 'Widowed']} />
              <DataSelect label="State of Origin" id="stateOrigin" value={formData.stateOrigin || ''} onChange={(v: string) => handleChange('stateOrigin', v)} options={NIGERIA_STATES} />
              <DataInput label="LGA of Origin" id="lgaOrigin" value={formData.lgaOrigin || ''} onChange={(v: string) => handleChange('lgaOrigin', v)} />
              <DataInput label="Town/Village" id="town" value={formData.town || ''} onChange={(v: string) => handleChange('town', v)} />
              <DataSelect label="Mode of ID" id="idMode" value={formData.idMode || ''} onChange={(v: string) => handleChange('idMode', v)} options={['NIN', 'Voters Card', 'Drivers License', 'International Passport']} />
              <DataInput label="Valid ID Number" id="idNumber" value={formData.idNumber || ''} onChange={(v: string) => handleChange('idNumber', v)} />
              <DataInput label="Email Address" id="email" type="email" value={formData.email || ''} onChange={(v: string) => handleChange('email', v)} />
              <DataInput label="Phone Number" id="phone" type="tel" value={formData.phone || ''} onChange={(v: string) => handleChange('phone', v)} />
              <DataInput label="Place of Birth" id="birthPlace" value={formData.birthPlace || ''} onChange={(v: string) => handleChange('birthPlace', v)} />
              <DataSelect label="State of Birth" id="birthState" value={formData.birthState || ''} onChange={(v: string) => handleChange('birthState', v)} options={NIGERIA_STATES} />
              <DataInput label="LGA of Birth" id="birthLga" value={formData.birthLga || ''} onChange={(v: string) => handleChange('birthLga', v)} />
              
              {/* File Upload */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                <FileUpload label="Upload Affidavit*" id="affidavit" file={affidavitFile} isUploading={isUploading} onChange={handleFileUpload} />
              </div>
            </div>
          </section>

          {/* 2. Registration Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-gray-500" /> Registration Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataSelect label="Registration State (Resident)" id="regState" value={formData.regState || ''} onChange={(v: string) => handleChange('regState', v)} options={NIGERIA_STATES} />
              <DataInput label="Registration LGA" id="regLga" value={formData.regLga || ''} onChange={(v: string) => handleChange('regLga', v)} />
              <DataInput label="Nearest Registration Center" id="regCenter" value={formData.regCenter || ''} onChange={(v: string) => handleChange('regCenter', v)} />
              <div className="md:col-span-2">
                <DataInput label="Current Residential Address" id="resAddress" value={formData.resAddress || ''} onChange={(v: string) => handleChange('resAddress', v)} />
              </div>
              <DataSelect label="Highest Education" id="education" value={formData.education || ''} onChange={(v: string) => handleChange('education', v)} options={['None', 'Primary', 'Secondary', 'Tertiary']} />
              <DataInput label="Occupation" id="occupation" value={formData.occupation || ''} onChange={(v: string) => handleChange('occupation', v)} />
              <div className="md:col-span-2">
                <DataInput label="Address of Place of Work" id="workAddress" value={formData.workAddress || ''} onChange={(v: string) => handleChange('workAddress', v)} />
              </div>
              <DataInput label="Reason for Request" id="reason" value={formData.reason || ''} onChange={(v: string) => handleChange('reason', v)} />
              <DataInput label="As a Requirement for" id="requirement" value={formData.requirement || ''} onChange={(v: string) => handleChange('requirement', v)} />
              <div className="md:col-span-2">
                <DataInput label="Address of Requesting Party" id="partyAddress" value={formData.partyAddress || ''} onChange={(v: string) => handleChange('partyAddress', v)} placeholder="Company, School, Embassy, etc." />
              </div>
            </div>
          </section>

          {/* 3. Father's Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" /> Father's Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataInput label="Surname" id="fatherSurname" value={formData.fatherSurname || ''} onChange={(v: string) => handleChange('fatherSurname', v)} />
              <DataInput label="First Name" id="fatherFirst" value={formData.fatherFirst || ''} onChange={(v: string) => handleChange('fatherFirst', v)} />
              <DataSelect label="State of Origin" id="fatherState" value={formData.fatherState || ''} onChange={(v: string) => handleChange('fatherState', v)} options={NIGERIA_STATES} />
              <DataInput label="LGA of Origin" id="fatherLga" value={formData.fatherLga || ''} onChange={(v: string) => handleChange('fatherLga', v)} />
              <DataInput label="Village/Town" id="fatherTown" value={formData.fatherTown || ''} onChange={(v: string) => handleChange('fatherTown', v)} />
            </div>
          </section>

          {/* 4. Mother's Details */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" /> Mother's Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataInput label="Surname" id="motherSurname" value={formData.motherSurname || ''} onChange={(v: string) => handleChange('motherSurname', v)} />
              <DataInput label="First Name" id="motherFirst" value={formData.motherFirst || ''} onChange={(v: string) => handleChange('motherFirst', v)} />
              <DataInput label="Maiden Name" id="motherMaiden" value={formData.motherMaiden || ''} onChange={(v: string) => handleChange('motherMaiden', v)} />
              <DataSelect label="State of Origin" id="motherState" value={formData.motherState || ''} onChange={(v: string) => handleChange('motherState', v)} options={NIGERIA_STATES} />
              <DataInput label="LGA of Origin" id="motherLga" value={formData.motherLga || ''} onChange={(v: string) => handleChange('motherLga', v)} />
              <DataInput label="Village/Town" id="motherTown" value={formData.motherTown || ''} onChange={(v: string) => handleChange('motherTown', v)} />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-200">
            {submitError && <p className="mb-4 text-red-600 text-center font-medium bg-red-50 p-2 rounded">{submitError}</p>}
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full rounded-lg bg-green-600 px-4 py-4 text-base font-bold text-white shadow-lg hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Processing...' : `Submit Application (Fee: ₦${serviceFee.toLocaleString()})`}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
