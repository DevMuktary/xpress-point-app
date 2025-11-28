"use client";

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import Loading from '@/app/loading';
import { Decimal } from 'decimal.js'; 

// Define the shape of the data coming from the server (Stringified Decimals)
type SerializedService = {
  id: string;
  name: string;
  category: string;
  platformPrice: string;
  defaultAgentPrice: string;
  isActive: boolean;
};

// Define the shape of the data used in the component (Real Decimals)
type Service = {
  id: string;
  name: string;
  category: string;
  platformPrice: Decimal;
  defaultAgentPrice: Decimal;
  isActive: boolean;
};

// Helper to hydrate strings to Decimals
const hydrateService = (service: SerializedService): Service => ({
  id: service.id,
  name: service.name,
  category: service.category,
  platformPrice: new Decimal(service.platformPrice),
  defaultAgentPrice: new Decimal(service.defaultAgentPrice),
  isActive: service.isActive
});

type Props = {
  initialServices: SerializedService[];
};

export default function AdminServicePricingClientPage({ initialServices }: Props) {
  
  // --- State Management ---
  const [services, setServices] = useState<Service[]>(initialServices.map(hydrateService));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Edit State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentPlatformPrice, setCurrentPlatformPrice] = useState<string>('');
  const [currentAgentPrice, setCurrentAgentPrice] = useState<string>('');
  
  // --- Toggle State ---
  const [isToggling, setIsToggling] = useState<string | null>(null);

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

  // --- Handlers ---

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

  // Save Price Changes
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

      // Re-hydrate the updated service returned from API
      const updatedServiceWithDecimals = hydrateService(data.updatedService);
      
      setServices(prev => prev.map(s => 
        s.id === serviceId ? updatedServiceWithDecimals : s
      ));
      
      setSuccess('Price updated successfully!');
      handleCancel(); 

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Availability
  const handleToggle = async (serviceId: string, currentStatus: boolean) => {
    setIsToggling(serviceId);
    try {
      const res = await fetch('/api/admin/services/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, isActive: !currentStatus })
      });

      if (!res.ok) throw new Error('Failed');

      // Update local state
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, isActive: !currentStatus } : s));

    } catch (error) {
      alert("Failed to toggle status.");
    } finally {
      setIsToggling(null);
    }
  };
  
  return (
    <div className="space-y-6">
      {(isLoading) && <Loading />}

      {/* Search Bar */}
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

      {/* Service Groups */}
      <div className="space-y-8">
        {Object.keys(servicesByCategory).map(category => (
          <div key={category} className="rounded-2xl bg-white shadow-lg overflow-hidden border border-gray-200">
            {/* Category Header */}
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
               <CurrencyDollarIcon className="h-5 w-5 text-gray-500"/>
               {category.replace(/_/g, ' ')}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Cost (₦)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Agent Price (₦)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Profit (₦)</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servicesByCategory[category].map(service => (
                    <tr key={service.id} className={`hover:bg-gray-50 transition-colors ${!service.isActive ? 'bg-red-50/50' : ''}`}>
                      
                      {/* 1. Availability Toggle */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(service.id, service.isActive)}
                          disabled={isToggling === service.id}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${service.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${service.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                          />
                        </button>
                      </td>

                      {/* 2. Service Name */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        {!service.isActive && <span className="text-xs text-red-600 font-bold">Inactive</span>}
                      </td>
                      
                      {/* 3. Platform Price (Cost) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === service.id ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={currentPlatformPrice}
                              onChange={(e) => setCurrentPlatformPrice(e.target.value)}
                              className="w-28 rounded-md border border-blue-500 p-1 pl-2 text-sm shadow-sm"
                              placeholder="Cost"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-mono text-gray-500">
                            ₦{service.platformPrice.toString()}
                          </span>
                        )}
                      </td>
                      
                      {/* 4. Agent Price (Selling Price) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingId === service.id ? (
                          <div className="relative">
                            <input
                              type="number"
                              value={currentAgentPrice}
                              onChange={(e) => setCurrentAgentPrice(e.target.value)}
                              className="w-28 rounded-md border border-green-500 p-1 pl-2 text-sm shadow-sm font-bold"
                              placeholder="Price"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            ₦{service.defaultAgentPrice.toString()}
                          </span>
                        )}
                      </td>

                      {/* 5. Profit Calculation (Agent - Platform) */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                          service.defaultAgentPrice.minus(service.platformPrice).isNegative() 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          ₦{service.defaultAgentPrice.minus(service.platformPrice).toString()}
                        </span>
                      </td>

                      {/* 6. Action Buttons */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === service.id ? (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleSave(service.id)}
                              className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                              title="Save"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              title="Cancel"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="Edit Prices"
                          >
                            <PencilIcon className="h-4 w-4" /> Edit
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


