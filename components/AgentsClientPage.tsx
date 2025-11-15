"use client"; // This is an interactive component

import React, { useState, useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  DocumentMagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { User } from '@prisma/client'; // Import the base type

// Define the props to receive the initial data from the server
// We use a "Partial" User type because we only selected a few fields
type Agent = Partial<User>; 
type Props = {
  initialAgents: Agent[];
};

export default function AgentsClientPage({ initialAgents }: Props) {
  
  // --- State Management ---
  const [agents, setAgents] = useState(initialAgents);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Filtering Logic ---
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const searchData = `${agent.firstName} ${agent.lastName} ${agent.email} ${agent.phoneNumber}`.toLowerCase();
      return searchData.includes(searchTerm.toLowerCase());
    });
  }, [agents, searchTerm]);

  // Helper to format the date
  const formatDate = (dateString: Date | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      {/* --- 1. Filter & Search Bar --- */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* --- 2. The "One-by-One" Card List --- */}
      <div className="space-y-4">
        {filteredAgents.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12" />
            <p className="mt-2 font-semibold">No Agents Found</p>
            <p className="text-sm">No agents match your search, or none have registered under you yet.</p>
          </div>
        )}

        {filteredAgents.map((agent) => (
          <div 
            key={agent.id} 
            className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              {/* Left Side (Name & Date) */}
              <div>
                <p className="text-base font-semibold text-gray-900">
                  {agent.firstName} {agent.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Joined: {formatDate(agent.createdAt)}
                </p>
              </div>
              
              {/* Right Side (Contact) */}
              <div className="mt-4 sm:mt-0 sm:ml-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{agent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{agent.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
