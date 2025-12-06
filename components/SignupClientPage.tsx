"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loading from '@/app/loading';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  UserIcon, 
  BriefcaseIcon, 
  HomeIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline';
import PhoneInput from 'react-phone-number-input/input';
import { E164Number } from 'libphonenumber-js'; 

type Props = {
  aggregatorId?: string;
  aggregatorName?: string;
};

export default function SignupClientPage({ aggregatorId, aggregatorName }: Props) {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<E164Number | string>(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreeToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          businessName,
          address,
          email,
          phone,
          password,
          aggregatorId: aggregatorId || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      router.push(`/verify-otp?phone=${encodeURIComponent(phone)}`);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <Loading />}
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Sign Up Form */}
      <form 
        className="mt-8 space-y-6 rounded-2xl bg-white p-8 shadow-xl" 
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DataInput label="First Name*" id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} Icon={UserIcon} />
            <DataInput label="Last Name*" id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} Icon={UserIcon} />
          </div>

          <DataInput label="Business Name (Optional)" id="business-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} Icon={BriefcaseIcon} isRequired={false} />
          <DataInput label="Business Address (Optional)" id="address" value={address} onChange={(e) => setAddress(e.target.value)} Icon={HomeIcon} isRequired={false} />

          <DataInput label="Email Address*" id="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} Icon={EnvelopeIcon} type="email" />
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              WhatsApp Phone Number*
            </label>
            <div className="mt-1">
              <PhoneInput
                id="phone"
                name="phone"
                country="NG"
                value={phone}
                onChange={(value: E164Number | undefined) => setPhone(value || '')}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
              />
            </div>
          </div>

          <PasswordInput
            label="Create Password*"
            id="password"
            value={password}
            onChange={setPassword}
            show={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
          />
          <PasswordInput
            label="Confirm Password*"
            id="confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirmPassword}
            onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <div className="flex items-start">
          <div className="flex h-6 items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label htmlFor="terms" className="font-medium text-gray-900">
              I agree to the{' '}
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
              .
            </label>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
        
        {/* --- FIXED LINK TEXT --- */}
        <div className="text-center text-sm text-gray-600">
          Have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login
          </Link>
        </div>
      </form>
    </>
  );
}

const DataInput = ({ label, id, value, onChange, Icon, type = "text", isRequired = true, placeholder = "" }: {
  label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, Icon: React.ElementType, type?: string, isRequired?: boolean, placeholder?: string
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        id={id} name={id} type={type}
        value={value} onChange={onChange}
        required={isRequired}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg pl-10 shadow-sm"
      />
    </div>
  </div>
);

const PasswordInput = ({ label, id, value, onChange, show, onToggle }: {
  label: string, id: string, value: string, onChange: (value: string) => void, show: boolean, onToggle: () => void
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 relative">
      <input
        id={id} name={id}
        type={show ? "text" : "password"}
        value={value} onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-lg shadow-sm"
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3"
        onClick={onToggle}
      >
        {show ? (
          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
    </div>
  </div>
);
