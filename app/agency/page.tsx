"use client";

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  ShieldCheckIcon, 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import SafeImage from '@/components/SafeImage';

type ResultItem = {
  id: string;
  ticketNumber: string;
  bvn: string | null;
  status: string;
  message: string | null;
  updatedAt: string;
};

type AgentInfo = {
  name: string;
  business: string | null;
};

export default function AgencyPortalPage() {
  const [agentCode, setAgentCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ agent: AgentInfo, results: ResultItem[] } | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (agentCode.length < 6) return;
    
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch('/api/agency/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentCode })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch records.');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'APPROVED' || s === 'SUCCESS') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircleIcon className="w-3 h-3" /> SUCCESS</span>;
    if (s === 'REJECTED' || s === 'FAILED') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800"><XCircleIcon className="w-3 h-3" /> REJECTED</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><ClockIcon className="w-3 h-3" /> PENDING</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
           <SafeImage src="/logos/logo.png" alt="Logo" width={64} height={64} className="rounded-xl shadow-md" fallbackSrc="/logos/default.png" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Agency Enrollment Portal
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your 6-digit Agent Code to verify enrollment status.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-md">
        <form onSubmit={handleCheck} className="relative">
          <input
            type="text"
            maxLength={6}
            className="block w-full rounded-2xl border-0 py-4 pl-5 pr-12 text-gray-900 shadow-xl ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-lg sm:leading-6 text-center font-mono tracking-widest uppercase"
            placeholder="ENTER CODE"
            value={agentCode}
            onChange={(e) => setAgentCode(e.target.value.toUpperCase())}
          />
          <button
            type="submit"
            disabled={isLoading || agentCode.length < 6}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 rounded-xl text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? <ArrowPathIcon className="w-6 h-6 animate-spin" /> : <MagnifyingGlassIcon className="w-6 h-6" />}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-700 text-sm animate-in slide-in-from-top-2">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {data && (
        <div className="w-full max-w-4xl mt-10 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Agent Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Agent Name</p>
              <p className="text-lg font-bold text-gray-900">{data.agent.name}</p>
            </div>
            {data.agent.business && (
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Business Name</p>
                <p className="text-lg font-bold text-gray-900">{data.agent.business}</p>
              </div>
            )}
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket Number</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">BVN / Feedback</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No enrollment records found for this agent code.
                      </td>
                    </tr>
                  ) : (
                    data.results.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                          {row.ticketNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(row.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {row.bvn ? (
                            <span className="font-mono font-bold text-green-700 tracking-wider">{row.bvn}</span>
                          ) : (
                            <span className="text-red-600 italic">{row.message || 'Processing...'}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-gray-500">
                          {new Date(row.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
