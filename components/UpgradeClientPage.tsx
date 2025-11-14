"use client"; // This is an interactive component

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  LinkIcon,
  ClipboardIcon,
  ClipboardDocumentCheckIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import Link from 'next/link';

// --- "World-Class" Type Definitions ---
type Bank = {
  name: string;
  code: string;
};
type Props = {
  fee: number;
};

// --- "Sleek Copy Button" Component ---
const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all
        ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      {copied ? <ClipboardDocumentCheckIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

// --- "World-Class" Reusable Input Component ---
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
        className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
        required={isRequired}
        placeholder={placeholder}
      />
    </div>
  </div>
);

// --- The Main "World-Class" Component ---
export default function UpgradeClientPage({ fee }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('/api/services/banks');
        if (!res.ok) throw new Error('Failed to fetch banks.');
        const data = await res.json();
        setBanks(data.banks);
      } catch (err: any) {
        console.error("Fetch Banks Error:", err.message);
      }
    };
    fetchBanks();
  }, []);

  const handleVerifyAccount = async () => {
    setIsVerifying(true);
    setError(null);
    setAccountName('');
    
    try {
      const res = await fetch(`/api/services/verify-account?account_number=${accountNumber}&bank_code=${bankCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Account verification failed.');
      setAccountName(data.accountName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError(null);

    const selectedBank = banks.find(b => b.code === bankCode);
    if (!selectedBank) {
      setError("Please select a valid bank.");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/aggregator/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bankName: selectedBank.name,
          accountNumber,
          accountName,
          businessName
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upgrade failed.');
      }
      
      setSubdomain(data.subdomain);
      setStep(4);

    } catch (err: any) { 
      setError(err.message);
      setStep(2); // Go back to bank step
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setIsModalOpen(false);
    if (step === 4) {
      window.location.reload();
    }
    setStep(1);
    setError(null);
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setBusinessName('');
    setSubdomain('');
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}

      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900">
          Unlock Aggregator Tools
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Upgrade your account to an Aggregator to manage your own agents, 
          earn commissions on every transaction, and grow your business.
        </p>
        <ul className="mt-4 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">Manage Your Own Agents</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">Earn Commissions on Every Agent Transaction</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">Get a Unique Referral Link (Subdomain)</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-700">Access the "World-Class" Payouts Dashboard</span>
          </li>
        </ul>
        <div className="border-t border-gray-100 mt-6 pt-6">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            Upgrade Now (One-Time Fee: ₦{fee})
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            {isLoading && <Loading />}
            
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 1 && 'Confirm Upgrade'}
                {step === 2 && 'Enter Bank Details'}
                {step === 3 && 'Enter Business Name'}
                {step === 4 && 'Upgrade Successful!'}
              </h2>
              <button onClick={resetFlow}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6">
              {error && (
                <p className="mb-4 text-sm font-medium text-red-600 text-center">{error}</p>
              )}
              
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-center text-gray-600">
                    Are you sure you want to upgrade to an Aggregator? Your wallet 
                    will be charged a one-time, non-refundable fee.
                  </p>
                  <p className="text-center text-3xl font-bold text-blue-600">
                    ₦{fee}
                  </p>
                </div>
              )}
              
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Enter your payout bank details. This is where your commissions will be sent.</p>
                  <div>
                    <label htmlFor="bank" className="block text-sm font-medium text-gray-700">Select Bank*</label>
                    <select
                      id="bank"
                      value={bankCode}
                      onChange={(e) => { setBankCode(e.target.value); setAccountName(''); }}
                      className="w-full rounded-lg border border-gray-300 p-3 shadow-sm"
                    >
                      <option value="">-- Select a Bank --</option>
                      {banks.map(bank => (
                        <option key={bank.code} value={bank.code}>{bank.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">Account Number*</label>
                    <div className="flex gap-2">
                      <input
                        id="accountNumber" type="tel" value={accountNumber}
                        onChange={(e) => { setAccountNumber(e.target.value); setAccountName(''); }}
                        maxLength={10}
                        className="flex-1 w-full rounded-lg border border-gray-300 p-3 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAccount}
                        disabled={isVerifying || accountNumber.length < 10 || !bankCode}
                        className="rounded-lg bg-gray-200 px-4 text-sm font-semibold text-gray-800 disabled:opacity-50"
                      >
                        {isVerifying ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </div>
                  
                  {accountName && (
                    <div className="rounded-lg bg-green-50 p-3 border border-green-200">
                      <p className="text-sm font-bold text-green-800">{accountName}</p>
                    </div>
                  )}
                </div>
              )}
              
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Enter your Business Name. This will be used to create your "world-class" referral link.</p>
                  <DataInput label="Business Name*" id="bizName" value={businessName} onChange={setBusinessName} Icon={BuildingOfficeIcon} placeholder="e.g., Raudah Tech" />
                </div>
              )}
              
              {/* --- THIS IS THE "WORLD-CLASS" FIX --- */}
              {step === 4 && (
                <div className="space-y-4 text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-900">Upgrade Complete!</h3>
                  <p className="text-sm text-gray-600">
                    Your account is now a "world-class" Aggregator. Your "stunning" new referral link is:
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-3 border border-gray-200">
                    <LinkIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <span className="flex-1 text-sm font-medium text-blue-600 break-all">
                      https://{subdomain}.xpresspoint.net
                    </span>
                    <CopyButton textToCopy={`https://${subdomain}.xpresspoint.net`} />
                  </div>
                </div>
              )}
              {/* ------------------------------------ */}
            </div>
            
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Confirm & Pay (₦{fee})
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  disabled={!accountName} // "World-class" - must verify first
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              )}
              {step === 3 && (
                <button
                  onClick={handleFinalSubmit}
                  disabled={!businessName}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  Finish Upgrade
                </button>
              )}
              {step === 4 && (
                <button
                  onClick={resetFlow}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
