"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon,
  XMarkIcon,
  XCircleIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import { ValidationRequest } from '@prisma/client';

// --- Types ---
type Props = {
  prices: { [key: string]: number };
  availability: { [key: string]: boolean };
  initialRequests: ValidationRequest[];
};

// We only have 2 types now
type ValidationType = 'NO_RECORD' | 'UPDATE_RECORD';

// --- Modern Button ---
const ModTypeButton = ({ title, description, selected, onClick, disabled = false }: any) => (
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

// --- Input Component ---
const DataInput = ({ label, id, value, onChange, Icon, type = "text" }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      />
    </div>
  </div>
);

export default function NinValidationClientPage({ prices, initialRequests, availability }: Props) {
  const [validationType, setValidationType] = useState<ValidationType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [nin, setNin] = useState('');
  const [requests, setRequests] = useState(initialRequests);

  // Map local type to DB Service ID for price lookup
  const getServiceId = (type: ValidationType) => {
    if (type === 'NO_RECORD') return 'NIN_VAL_NO_RECORD';
    if (type === 'UPDATE_RECORD') return 'NIN_VAL_UPDATE_RECORD';
    return '';
  };

  const fee = useMemo(() => {
    if (!validationType) return 0;
    return prices[getServiceId(validationType)] || 0;
  }, [validationType, prices]);

  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validationType) {
        setError("Please select a validation type.");
        return;
    }
    if (nin.length < 11) {
        setError("Enter a valid NIN.");
        return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);

    try {
      const response = await fetch('/api/services/nin/validation-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nin,
          validationType 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed.');
      
      setSuccess(data.message);
      // Refresh history manually or via router.refresh()
      window.location.reload(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
   
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' };
      case 'PROCESSING': return { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon, text: 'Processing' };
      case 'PENDING': return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' };
      case 'FAILED': return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Failed' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Unknown' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Important Instructions */}
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex gap-3">
         <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
         <div className="text-sm text-red-900">
            <h4 className="font-bold mb-1">Important Instructions</h4>
            <ul className="list-disc list-inside space-y-1">
                <li>Please ensure the NIN you submit has an issue that requires validation.</li>
                <li>This service is not Refundable and Cannot be cancelled once submitted.</li>
                <li>The NIN May be validated within before or within 48hrs sometime. But the Status will change within 72hrs or more.</li>
            </ul>
         </div>
      </div>

      {isLoading && <Loading />}
      
      {/* Success Banner */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-bold text-green-800">Request Submitted!</h3>
            <p className="mt-1 text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <form onSubmit={handleOpenConfirmModal} className="space-y-6">
          
          {/* 1. Select Type */}
          <div>
            <label className="text-lg font-bold text-gray-900">1. Select Validation Reason</label>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModTypeButton 
                title="No Record Found" 
                description={`Fee: ₦${prices['NIN_VAL_NO_RECORD'] || 0}`} 
                selected={validationType === 'NO_RECORD'} 
                // Fallback to true if availability is undefined (during transition)
                disabled={availability['NIN_VAL_NO_RECORD'] === false} 
                onClick={() => setValidationType('NO_RECORD')} 
              />
              <ModTypeButton 
                title="Update Record (Modification Validation Name/Phone number/address/ Except DOB"
                description={`Fee: ₦${prices['NIN_VAL_UPDATE_RECORD'] || 0}`} 
                selected={validationType === 'UPDATE_RECORD'} 
                disabled={availability['NIN_VAL_UPDATE_RECORD'] === false} 
                onClick={() => setValidationType('UPDATE_RECORD')} 
              />
            </div>
          </div>

          {/* 2. Enter Details */}
          {validationType && (
            <div className="border-t border-gray-200 pt-6 space-y-6 animate-in fade-in slide-in-from-top-4">
              
              <h3 className="text-lg font-bold text-gray-900">2. Enter Details</h3>
              <DataInput label="NIN Number*" id="nin" value={nin} onChange={setNin} Icon={IdentificationIcon} />
              
              <div className="pt-4">
                {error && <p className="mb-4 text-sm font-medium text-red-600 text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* History */}
      <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mt-8">
         <h3 className="text-lg font-bold text-gray-900 mb-4">Validation History</h3>
         <div className="space-y-4">
            {requests.map((req) => {
               const statusInfo = getStatusInfo(req.status);
               return (
                 <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
                    <div>
                       <p className="font-bold text-gray-800">{req.scode.replace('_', ' ')}</p>
                       <p className="text-xs text-gray-500">{req.nin} • {new Date(req.createdAt).toLocaleDateString()}</p>
                       <p className="text-xs text-gray-600 mt-1 italic">{req.statusMessage}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                       {statusInfo.text}
                    </span>
                 </div>
               );
            })}
            {requests.length === 0 && <p className="text-center text-gray-500 py-4">No history found.</p>}
         </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Validation</h3>
              <p className="text-gray-600 text-sm mt-2">
                You are submitting a <strong>{validationType?.replace('_', ' ')}</strong> request for NIN <strong>{nin}</strong>.
              </p>
              <p className="mt-4 text-2xl font-bold text-blue-600">₦{fee}</p>
            </div>
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 py-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-700">Cancel</button>
              <button onClick={handleFinalSubmit} className="flex-1 py-2.5 bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-700">Yes, Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
