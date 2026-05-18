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

    // @ts-ignore - Paystack is loaded globally via the Next.js Script tag
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: payAmount * 100, // Paystack expects Kobo
      currency: 'NGN',
      ref: `XPRESS_${Math.floor(Math.random() * 1000000000)}_${Date.now()}`,
      callback: function (response: any) {
        // The payment was successful on the frontend!
        // Your Webhook uses the Secret Key to securely fund the wallet in the database.
        alert(`Payment Successful! Reference: ${response.reference}. Your wallet will reflect the balance momentarily.`);
        setAmount('');
      },
      onClose: function () {
        console.log('Payment window closed by user.');
      },
    });

    handler.openIframe();
  };

  return (
    <>
      {/* Securely loads Paystack's Modal Script */}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />

      {/* Vibrant Fintech Card Design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 rounded-3xl p-8 shadow-xl shadow-blue-500/20 text-white">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <CreditCardIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Instant Card Funding</h3>
              <p className="text-blue-100 text-sm mt-0.5">Zero delays. Powered by Paystack.</p>
            </div>
          </div>

          <form onSubmit={handlePaystackPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Amount to Fund (₦)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 font-bold text-lg">₦</span>
                <input
                  type="number"
                  min="100"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-black/20 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition-all text-lg font-medium tracking-wide backdrop-blur-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 font-bold text-lg px-6 py-4 rounded-2xl hover:bg-blue-50 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
            >
              <SparklesIcon className="h-5 w-5" />
              Pay with Paystack
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
