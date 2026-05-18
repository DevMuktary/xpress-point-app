"use client";

import React, { useState } from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function PaystackFundForm({ email }: { email: string }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) return alert("Minimum amount is ₦100");
    
    setLoading(true);
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount: Number(amount) })
      });
      
      const data = await res.json();
      
      if (data.authorization_url) {
        // Redirect user to Paystack
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || 'Failed to initialize payment');
      }
    } catch (err) {
      alert('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
          <BanknotesIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Pay with Paystack</h3>
          <p className="text-xs text-gray-500">Fund your wallet securely online</p>
        </div>
      </div>

      <form onSubmit={handleFund} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₦</span>
          <input
            type="number"
            min="100"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (e.g. 1000)"
            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Pay with Paystack'}
        </button>
      </form>
    </div>
  );
}
