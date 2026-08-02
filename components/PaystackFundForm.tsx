"use client";

import React, { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { CreditCardIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

export default function PaystackFundForm({ email }: { email: string }) {
  const [amount, setAmount] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handlePaystackPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = Number(amount);
    
    if (!payAmount || payAmount < 100) {
      return alert("Minimum funding amount is ₦100");
    }

    if (!email || email.trim() === '') {
      return alert("CRITICAL ERROR: User email is missing. Paystack requires an email.");
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    
    // Check if the key is accidentally a secret key
    if (!publicKey || !publicKey.startsWith('pk_')) {
      return alert("CRITICAL ERROR: Invalid Key.");
    }

    if (typeof (window as any).PaystackPop === 'undefined') {
      return alert("Paystack script is still loading. Please wait a second and try again.");
    }

    const handler = (window as any).PaystackPop.setup({
      key: publicKey.trim(),
      email: email.trim(),
      amount: payAmount * 100, 
      currency: 'NGN',
      ref: `XPRESS_${Math.floor(Math.random() * 1000000000)}_${Date.now()}`,
      callback: function (response: any) {
        setAmount('');
        setIsSuccess(true);

        setTimeout(() => {
          router.push('/dashboard');
          router.refresh(); 
        }, 3000);
      },
      onClose: function () {
        console.log("Payment modal closed");
      }
    });

    handler.openIframe();
  };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {isSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Completed!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Your transaction was successful. Redirecting to your dashboard to update your balance...
            </p>
            <div className="flex justify-center">
              <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-5 sm:p-6 shadow-md text-white">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-white/5 blur-xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <CreditCardIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Pay with Card</h3>
              <p className="text-blue-200 text-xs mt-0.5">Instant funding via Paystack</p>
            </div>
          </div>

          <form onSubmit={handlePaystackPayment} className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 font-bold text-sm">₦</span>
              <input
                type="number"
                min="100"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (e.g. 1000)"
                className="w-full pl-8 pr-3 py-2.5 bg-black/20 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-500 active:scale-[0.98] transition-all shadow-sm"
            >
              <SparklesIcon className="h-4 w-4" />
              Fund Now
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
