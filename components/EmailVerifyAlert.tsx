"use client";

import React, { useState } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function EmailVerifyAlert() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch('/api/auth/resend-otp', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        setMessage("Sent! Check your Spam folder too.");
      } else {
        setMessage(data.error || "Failed to send.");
      }
    } catch (error) {
      setMessage("Error sending email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Message Area */}
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-yellow-800">
              Email Not Verified
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              We sent a code to your email. If you don't see it, <span className="font-bold underline">check your Spam/Junk folder</span> and mark as "Not Spam".
            </p>
            {message && (
              <p className="mt-2 text-xs font-bold text-green-700 flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" /> {message}
              </p>
            )}
          </div>
        </div>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-yellow-800 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            "Resend Code"
          )}
        </button>
      </div>
    </div>
  );
}
