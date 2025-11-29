"use client"; 

import React, { useState, useEffect, useMemo } from 'react';
import { ResultRequest, RequestStatus } from '@prisma/client';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  ArrowPathIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentMagnifyingGlassIcon,
  XMarkIcon,
  IdentificationIcon,
  UserIcon,
  CalendarDaysIcon,
  HashtagIcon,
  GlobeAltIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

type HistoryRequest = ResultRequest & {
  service: { name: string };
};

type Props = {
  initialRequests: HistoryRequest[];
  availability: { [key: string]: boolean }; // <--- ADDED THIS
};

// --- UPDATED "Modern Button" Component ---
const ModTypeButton = ({ title, description, selected, onClick, disabled = false }: {
  title: string, description: string, selected: boolean, onClick: () => void, disabled?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-lg p-4 text-left transition-all border-2 w-full
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
const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "", maxLength = 524288 }: any) => (
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
        required={isRequired} placeholder={placeholder} maxLength={maxLength}
      />
    </div>
  </div>
);

// --- Reusable Select Component ---
const DataSelect = ({ label, id, value, onChange, Icon, children, isRequired = true }: any) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required={isRequired}
      >
        {children}
      </select>
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
        You will get the Result Slip within 24 working hours.
      </div>
    </div>
  </div>
);

// --- The Main Component ---
export default function ResultRequestClientPage({ initialRequests, availability }: Props) {
   
  // --- State Management ---
  type ServiceID = 'RESULT_REQUEST_WAEC' | 'RESULT_REQUEST_NECO' | 'RESULT_REQUEST_NABTEB';
  const [serviceId, setServiceId] = useState<ServiceID | null>(null);
   
  const [requests, setRequests] = useState(initialRequests);
  const [isLoading, setIsLoading] = useState(false); 
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // --- Form Data State ---
  const [regNumber, setRegNumber] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('');
  const [year, setYear] = useState('');
  const [sector, setSector] = useState('');
  const [serial, setSerial] = useState('');
  const [examType, setExamType] = useState('');

  // --- Dynamic Fee ---
  const fee = useMemo(() => {
    if (serviceId === 'RESULT_REQUEST_WAEC') return 1000;
    if (serviceId === 'RESULT_REQUEST_NECO') return 1000;
    if (serviceId === 'RESULT_REQUEST_NABTEB') return 1000;
    return 0;
  }, [serviceId]);

  // --- API Fetch on Load ---
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch(`/api/services/exam-pins/history-request`);
      if (!res.ok) throw new Error('Failed to fetch history.');
      const data = await res.json();
      setRequests(data.requests);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };
   
  // --- Handle Open Confirmation Modal ---
  const handleOpenConfirmModal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    if (!serviceId) {
      setSubmitError("Please select an exam type.");
      return;
    }
    setIsConfirmModalOpen(true);
  };
   
  // --- Final Submit ---
  const handleFinalSubmit = async () => {
    setIsConfirmModalOpen(false);
    setIsLoading(true);
    
    let formData: any = {};
    if (serviceId === 'RESULT_REQUEST_NECO') {
      formData = { regNumber, name, phone, network };
    } else if (serviceId === 'RESULT_REQUEST_WAEC') {
      formData = { regNumber, year, sector, serial };
    } else if (serviceId === 'RESULT_REQUEST_NABTEB') {
      formData = { regNumber, examType, year, serial };
    }

    try {
      const response = await fetch('/api/services/exam-pins/request-submit', {
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
      setRegNumber(''); setName(''); setPhone(''); setNetwork('');
      setYear(''); setSector(''); setSerial(''); setExamType('');
      fetchHistory(); 

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
   
  // --- Filtering Logic ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const formData = req.formData as any;
      const searchData = formData.regNumber || formData.name || '';
      const matchesSearch = searchData.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = (statusFilter === 'ALL' || req.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
   
  const getStatusInfo = (status: RequestStatus) => {
    switch (status) {
      case 'COMPLETED': return { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Completed' };
      case 'PROCESSING': return { color: 'bg-blue-100 text-blue-800', icon: ArrowPathIcon, text: 'Processing' };
      case 'PENDING': return { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' };
      case 'FAILED': return { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Failed' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: ClockIcon, text: 'Unknown' };
    }
  };
   
  const renderActionButton = (request: HistoryRequest) => {
    switch (request.status) {
      case 'COMPLETED':
        return (
          <a 
            href={request.uploadedSlipUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={`rounded-lg px-3 py-2 text-sm font-semibold text-white flex items-center justify-center gap-2
              ${request.uploadedSlipUrl 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Download Result Slip
          </a>
        );
      case 'FAILED':
        return (
          <div className="text-sm text-center text-red-600 p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold">Sorry, this failed 😞</p>
            <p className="text-xs">{request.statusMessage || 'Please contact support.'}</p>
          </div>
        );
      default: // PENDING or PROCESSING
        return (
          <div className="text-sm text-center text-yellow-800 p-2 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="font-semibold">{request.status}</p>
            <p className="text-xs">{request.statusMessage}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}
      
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
                  Your request is now <strong className="font-semibold">PENDING</strong>. You can monitor its status below.
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
          
          {/* --- Exam Type Selection --- */}
          <div>
            <label className="text-lg font-semibold text-gray-900">
              1. Select Exam Type
            </label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              <ModTypeButton
                title="WAEC"
                description="Fee: ₦1000"
                selected={serviceId === 'RESULT_REQUEST_WAEC'}
                disabled={!availability['RESULT_REQUEST_WAEC']} // <--- Apply Availability Check
                onClick={() => setServiceId('RESULT_REQUEST_WAEC')}
              />
              <ModTypeButton
                title="NECO"
                description="Fee: ₦1000"
                selected={serviceId === 'RESULT_REQUEST_NECO'}
                disabled={!availability['RESULT_REQUEST_NECO']} // <--- Apply Availability Check
                onClick={() => setServiceId('RESULT_REQUEST_NECO')}
              />
              <ModTypeButton
                title="NABTEB"
                description="Fee: ₦1000"
                selected={serviceId === 'RESULT_REQUEST_NABTEB'}
                disabled={!availability['RESULT_REQUEST_NABTEB']} // <--- Apply Availability Check
                onClick={() => setServiceId('RESULT_REQUEST_NABTEB')}
              />
            </div>
          </div>

          {/* --- Conditional Form Fields --- */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Enter Required Details</h3>
              
              {/* === NECO === */}
              {serviceId === 'RESULT_REQUEST_NECO' && (
                <div className="space-y-4">
                  <DataInput label="Reg Number*" id="regNumber" value={regNumber} onChange={setRegNumber} Icon={IdentificationIcon} />
                  <DataInput label="Full Name*" id="name" value={name} onChange={setName} Icon={UserIcon} />
                  <DataInput label="Phone Number*" id="phone" value={phone} onChange={setPhone} Icon={PhoneIcon} type="tel" maxLength={11} />
                  <DataSelect label="Network*" id="network" value={network} onChange={setNetwork} Icon={GlobeAltIcon}>
                    <option value="">-- Select Network --</option>
                    <option value="MTN">MTN</option>
                    <option value="GLO">GLO</option>
                    <option value="AIRTEL">AIRTEL</option>
                    <option value="9MOBILE">9MOBILE</option>
                  </DataSelect>
                </div>
              )}

              {/* === WAEC === */}
              {serviceId === 'RESULT_REQUEST_WAEC' && (
                <div className="space-y-4">
                  <DataInput label="Examination Number*" id="regNumber" value={regNumber} onChange={setRegNumber} Icon={IdentificationIcon} />
                  <DataInput label="Examination Year*" id="year" value={year} onChange={setYear} Icon={CalendarDaysIcon} type="number" />
                  <DataSelect label="Examination Sector*" id="sector" value={sector} onChange={setSector} Icon={GlobeAltIcon}>
                    <option value="">-- Select Sector --</option>
                    <option value="School Candidate">School Candidate</option>
                    <option value="Private Candidate">Private Candidate</option>
                  </DataSelect>
                  <DataInput label="Serial No.*" id="serial" value={serial} onChange={setSerial} Icon={HashtagIcon} />
                </div>
              )}

              {/* === NABTEB === */}
              {serviceId === 'RESULT_REQUEST_NABTEB' && (
                <div className="space-y-4">
                  <DataInput label="Candidate Number*" id="regNumber" value={regNumber} onChange={setRegNumber} Icon={IdentificationIcon} />
                  <DataSelect label="Examination Type*" id="examType" value={examType} onChange={setExamType} Icon={GlobeAltIcon}>
                    <option value="">-- Select Type --</option>
                    <option value="MAY/JUNE">MAY/JUNE</option>
                    <option value="NOV/DEC">NOV/DEC</option>
                  </DataSelect>
                  <DataInput label="Examination Year*" id="year" value={year} onChange={setYear} Icon={CalendarDaysIcon} type="number" />
                  <DataInput label="Card Serial Number*" id="serial" value={serial} onChange={setSerial} Icon={HashtagIcon} />
                </div>
              )}
            </div>
          )}
          
          {/* --- Submit Button --- */}
          {serviceId && (
            <div className="border-t border-gray-200 pt-6">
              {submitError && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{submitError}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : `Submit Request (Fee: ₦${fee})`}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* --- 3. History Section --- */}
      <div className="rounded-2xl bg-white p-6 shadow-lg mt-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">My Result Requests</h3>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Reg/Candidate No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option> 
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        
        {isHistoryLoading && (
          <div className="py-12 text-center text-gray-500">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-sm">Loading history...</p>
          </div>
        )}
        
        {!isHistoryLoading && filteredRequests.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 font-semibold text-gray-900">No History Found</p>
            <p className="text-sm">You have not submitted any result requests.</p>
          </div>
        )}
        
        <div className="mt-6 space-y-4">
          {filteredRequests.map((request) => {
            const statusInfo = getStatusInfo(request.status);
            const formData = request.formData as any;

            return (
              <div key={request.id} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {request.service.name}
                      </p>
                      <p className="text-sm text-gray-600 break-all font-mono mt-1">
                        {formData.regNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:ml-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}>
                        <statusInfo.icon className={`h-4 w-4 ${statusInfo.text === 'Processing' ? 'animate-spin' : ''}`} />
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  {renderActionButton(request)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Confirmation Modal --- */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Please Confirm</h2>
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
