"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { Service } from '@prisma/client';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
// --- THIS IS THE "WORLD-CLASS" FIX (Part 1) ---
// We now import from the "client-safe" library, not the "rubbish" Prisma runtime
import { Decimal } from 'decimal.js'; 
// ---------------------------------------------

// We must re-map the initial services to ensure prices are Decimal objects
type SerializedService = Omit<Service, 'platformPrice' | 'defaultAgentPrice'> & {
  platformPrice: string;
  defaultAgentPrice: string;
};

// This helper function safely converts the serialized strings back into Decimal objects
const hydrateService = (service: SerializedService | Service): Service => ({
  ...service,
  platformPrice: new Decimal(service.platformPrice),
  defaultAgentPrice: new Decimal(service.defaultAgentPrice),
});

type Props = {
  initialServices: SerializedService[]; // Expect serialized data
};

export default function AdminServicePricingClientPage({ initialServices }: Props) {
  
  // --- State Management ---
  // We hydrate the initial data to have real Decimal objects
  const [services, setServices] = useState(initialServices.map(hydrateService));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Edit State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPlatformPrice, setCurrentPlatformPrice] = useState<string>('');
  const [currentAgentPrice, setCurrentAgentPrice] = useState<string>('');

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
    setCurrentPlatformPrice(service.platformPrice.toString());
    setCurrentAgentPrice(service.defaultAgentPrice.toString());
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setCurrentPlatformPrice('');
    setCurrentAgentPrice('');
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
          newPlatformPrice: currentPlatformPrice,
          newAgentPrice: currentAgentPrice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update price.');
      }

      // --- THIS IS THE "WORLD-CLASS" FIX (Part 2) ---
      // We must "re-hydrate" the service object with Decimal prices
      const updatedServiceWithDecimals = hydrateService(data.updatedService);
      
      setServices(services.map(s => 
        s.id === serviceId ? updatedServiceWithDecimals : s
      ));
      // ---------------------------------
      
      setSuccess('Price updated successfully!');
      handleCancel(); // Close the edit state

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}

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

      {/* --- 2. The Grouped Table List --- */}
      <div className="space-y-8">
        {Object.keys(servicesByCategory).map(category => (
          <div key={category} className="rounded-2xl bg-white shadow-lg overflow-hidden">
            {/* Category Header */}
            <h3 className="text-xl font-bold text-gray-900 capitalize p-4 bg-gray-50 border-b border-gray-200">
              {category.replace(/_/g, ' ').toLowerCase()}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Cost (Platform)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Profit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servicesByCategory[category].map(service => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      {/* --- Service Name --- */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        <div className="text-xs text-gray-500">{service.id}</div>
                      </td>
                      
                      {/* --- Platform Price (Your Cost) --- */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === service.id ? (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                            <input
                              type="number"
                              value={currentPlatformPrice}
                              onChange={(e) => setCurrentPlatformPrice(e.target.value)}
                              className="w-28 rounded-md border border-blue-500 p-2 pl-6 text-sm shadow-sm"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            {/* This .toString() is now safe */}
                            ₦{service.platformPrice.toString()}
                          </span>
                        )}
                      </td>
                      
                      {/* --- Agent Price --- */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === service.id ? (
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                            <input
                              type="number"
                              value={currentAgentPrice}
                              onChange={(e) => setCurrentAgentPrice(e.target.value)}
                              className="w-28 rounded-md border border-blue-500 p-2 pl-6 text-sm shadow-sm"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                            {/* This .toString() is now safe */}
                            ₦{service.defaultAgentPrice.toString()}
                          </span>
                        )}
                      </td>

                      {/* --- Est. Profit --- */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-800">
                          {/* This .minus() is now safe */}
                          ₦{service.defaultAgentPrice.minus(service.platformPrice).toString()}
                        </span>
                      </td>

                      {/* --- Action Buttons --- */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === service.id ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSave(service.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Save"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="text-red-600 hover:text-red-900"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Prices"
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
