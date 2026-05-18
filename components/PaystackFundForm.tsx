"use client";

import React, { useState } from 'react';
import Script from 'next/script';
import { CreditCardIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function PaystackFundForm({ email }: { email: string }) {
  const [amount, setAmount] = useState('');

  const handlePaystackPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = Number(amount);
    
    if (!payAmount || payAmount < 100) {
      return alert("Minimum funding amount is ₦100");
    }

    // @ts-ignore
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: payAmount * 100, 
      currency: 'NGN',
      ref: `XPRESS_${Math.floor(Math.random() * 1000000000)}_${Date.now()}`,
      callback: function (response: any) {
        alert(`Payment Successful! Ref: ${response.reference}. Your wallet will reflect the balance momentarily.`);
        setAmount('');
      },
    });

    handler.openIframe();
  };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* COMPACT FINTECH CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-5 sm:p-6 shadow-md text-white">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl border border-white/10">
              <CreditCardIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Pay with Card</h3>
              <p className="text-blue-100 text-xs mt-0.5">Instant funding via Paystack</p>
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
                className="w-full pl-8 pr-3 py-2.5 bg-black/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-white text-blue-600 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 active:scale-[0.98] transition-all shadow-sm"
            >
              <SparklesIcon className="h-4 w-4" />
              Pay Now
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
