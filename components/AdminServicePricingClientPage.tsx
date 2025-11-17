"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { Service } from '@prisma/client';
import { 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  XMarkIcon,
  CurrencyDollarIcon
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
  
  // --- Edit Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');

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
  const handleEditClick = (service: Service) => {
    setCurrentService(service);
    setNewPrice(service.defaultAgentPrice.toString());
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentService(null);
    setNewPrice('');
  };

  // --- API Call to Save Price ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/pricing/update-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: currentService.id,
          newPrice: newPrice,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update price.');
      }

      // Update the price in our local state
      setServices(services.map(s => 
        s.id === currentService.id ? data.updatedService : s
      ));
      
      setSuccess('Price updated successfully!');
      handleCloseModal();

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
      
      {/* Global Success/Error Messages */}
      {error && !isModalOpen && <div className="rounded-md bg-red-100 p-4 text-sm font-medium text-red-700">{error}</div>}
      {success && !isModalOpen && <div className="rounded-md bg-green-100 p-4 text-sm font-medium text-green-700">{success}</div>}

      {/* --- 2. The Grouped List --- */}
      <div className="space-y-8">
        {Object.keys(servicesByCategory).map(category => (
          <div key={category} className="rounded-2xl bg-white shadow-lg">
            {/* Category Header */}
            <h3 className="text-xl font-bold text-gray-900 capitalize mb-4 border-b border-gray-200 p-4">
              {category.replace(/_/g, ' ').toLowerCase()}
            </h3>
            
            {/* Service List */}
            <div className="flow-root">
              <ul className="divide-y divide-gray-200">
                {servicesByCategory[category].map(service => (
                  <li key={service.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {service.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          ID: {service.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Your Cost</p>
                        <p className="text-sm font-medium text-gray-700">
                          ₦{service.platformPrice.toString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Agent Price</p>
                        <p className="text-sm font-semibold text-blue-600">
                          ₦{service.defaultAgentPrice.toString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleEditClick(service)}
                          className="p-2 text-blue-600 hover:text-blue-900 rounded-full hover:bg-blue-100"
                        >
                          <span className="sr-only">Edit</span>
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* --- 3. Edit Price Modal --- */}
      {isModalOpen && currentService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Price
              </h2>
              <button type="button" onClick={handleCloseModal}>
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {error && <div className="rounded-md bg-red-100 p-4 text-sm font-medium text-red-700">{error}</div>}
              
              <div>
                <label className="block text-xs font-medium text-gray-500">Service</label>
                <p className="text-base font-semibold text-gray-900">{currentService.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="platformPrice" className="block text-sm font-medium text-gray-700">
                    Your Cost (Platform Price)
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="platformPrice"
                      type="text"
                      readOnly
                      value={currentService.platformPrice.toString()}
                      className="w-full rounded-lg border border-gray-300 p-3 bg-gray-100 text-gray-500 shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="agentPrice" className="block text-sm font-medium text-gray-700">
                    New Agent Price (₦)
                  </label>
                  <div className="relative mt-1">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="agentPrice"
                      type="number"
                      step="0.01"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 p-3 pl-10 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex gap-4 border-t border-gray-200 bg-gray-50 p-4 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 rounded-lg bg-white py-2.5 px-4 text-sm font-semibold text-gray-800 border border-gray-300 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Price"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
