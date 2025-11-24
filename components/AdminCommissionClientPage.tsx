"use client";

import React, { useState } from 'react';
import { MagnifyingGlassIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type Service = {
  id: string;
  name: string;
  category: string;
  DefaultCommission: string;
};

export default function AdminCommissionClientPage({ services }: { services: Service[] }) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [commissions, setCommissions] = useState<Record<string, string>>(
    // Initialize state with DB values
    services.reduce((acc, s) => ({ ...acc, [s.id]: s.aggregatorCommission }), {})
  );
  
  const [isSaving, setIsSaving] = useState<string | null>(null); // ID of service being saved
  const [successId, setSuccessId] = useState<string | null>(null); // ID of success animation

  // --- Handle Save ---
  const handleSave = async (serviceId: string) => {
    setIsSaving(serviceId);
    setSuccessId(null);
    
    try {
      const amount = commissions[serviceId] || '0';
      
      const res = await fetch('/api/admin/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          commission: amount
        })
      });

      if (!res.ok) throw new Error('Failed to save');
      
      // Show success checkmark
      setSuccessId(serviceId);
      setTimeout(() => setSuccessId(null), 2000); // Hide after 2s

    } catch (error) {
      alert("Failed to save commission.");
    } finally {
      setIsSaving(null);
    }
  };

  // --- Filtering ---
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (₦)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-semibold">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative rounded-md shadow-sm max-w-[120px]">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">₦</span>
                      </div>
                      <input
                        type="number"
                        value={commissions[service.id]}
                        onChange={(e) => setCommissions({
                          ...commissions,
                          [service.id]: e.target.value
                        })}
                        className="block w-full rounded-md border-gray-300 pl-7 pr-3 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {successId === service.id ? (
                      <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700">
                        <CheckCircleIcon className="h-5 w-5 mr-1" /> Saved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSave(service.id)}
                        disabled={isSaving === service.id}
                        className="inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                      >
                        {isSaving === service.id ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          'Update'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
