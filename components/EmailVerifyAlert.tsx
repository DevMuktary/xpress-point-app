import React from 'react';
import { ExclamationTriangleIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";

export default function EmailVerifyAlert() {
  return (
    <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-yellow-800">
            Verify your Email Address
          </h3>
          <div className="mt-1 text-sm text-yellow-700">
            <p>
              We have sent a verification code (OTP) to your email address.
            </p>
            
            {/* The Critical Spam Warning */}
            <div className="mt-3 rounded-lg bg-yellow-100 p-3 border border-yellow-200">
              <p className="font-bold text-yellow-900 flex items-center gap-2">
                <EnvelopeOpenIcon className="h-4 w-4" />
                Can't find the email?
              </p>
              <ul className="mt-1 list-disc list-inside text-yellow-800 space-y-1">
                <li>Please check your <strong>SPAM</strong> or <strong>JUNK</strong> folder.</li>
                <li>
                  Click <strong>"Report Not Spam"</strong> (or "Move to Inbox") so you can receive future emails.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
