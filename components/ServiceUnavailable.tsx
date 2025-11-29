import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ServiceUnavailable({ message }: { message?: string }) {
  return (
    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
      </div>
      <h3 className="text-lg font-bold text-yellow-900">Service Temporarily Unavailable</h3>
      <p className="mt-2 text-sm text-yellow-700">
        {message || "This service is currently undergoing maintenance or is disabled by the administrator. Please check back later."}
      </p>
    </div>
  );
}
