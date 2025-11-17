"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { Service } from '@prisma/client';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import { Decimal } from '@prisma/client/runtime/library';

// Define the props to receive the initial data from the server
type Props = {
  initialServices: Service[];
};

export default function AdminServicePricingClientPage({ initialServices }: Props) {
  
  // --- State Management ---
  const [services, setServices] = useState(initialServices);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Edit State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<string>('');

  // --- Filtering Logic ---
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const searchData = `${service.name} ${service.category} ${service.id}`.toLowerCase();
      return searchData.includes(searchTerm.toLowerCase());
    });
  }, [services, searchTerm]);

  // --- Grouping Logic ---
  const servicesByCategory = useMemo(() => {
    return filteredServices.reduce((acc, service) => {
      (acc[service.category] = acc[service.category] || []).push(service);
      return acc;
    }, {} as { [key: string]: Service[] });
  }, [filteredServices]);

  // --- Edit Handlers ---
  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setCurrentPrice(service.defaultAgentPrice.toString());
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentPrice('');
  };

  // --- API Call to Save Price ---
  const handleSave = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/pricing/update-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: serviceId,
          newPrice: currentPrice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update price.');
      }

      // Update the price in our local state
      setServices(services.map(s => 
        s.id === serviceId ? data.updatedService : s
      ));
      
      setSuccess('Price updated successfully!');
      setEditingId(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {isLoading && <Loading />}

      {/* --- 1. Search Bar --- */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by Service Name, Category, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      {error && <div className="rounded-md bg-red-100 p-4 text-sm font-medium text-red-700">{error}</div>}
      {success && <div className="rounded-md bg-green-100 p-4 text-sm font-medium text-green-700">{success}</div>}

      {/* --- 2. The Grouped List --- */}
      <div className="space-y-8">
        {Object.keys(servicesByCategory).map(category => (
          <div key={category} className="rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 capitalize mb-4 border-b border-gray-200 pb-2">
              {category.replace(/_/g, ' ').toLowerCase()}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform Price (Our Cost)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Price (They Pay)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servicesByCategory[category].map(service => (
                    <tr key={service.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.id}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">₦{service.platformPrice.toString()}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === service.id ? (
                          <input
                            type="number"
                            value={currentPrice}
                            onChange={(e) => setCurrentPrice(e.target.value)}
                            className="w-24 rounded-md border border-blue-500 p-2 text-sm shadow-sm"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-blue-600">₦{service.defaultAgentPrice.toString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === service.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(service.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
