import React from 'react';

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="antialiased text-gray-900 bg-gray-50 min-h-screen font-sans">
      {children}
    </div>
  );
}
