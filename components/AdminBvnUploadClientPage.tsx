"use client";

import React, { useState } from 'react';
import { ArrowPathIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function AdminBvnUploadClientPage({ totalRecords, recentUploads }: { totalRecords: number, recentUploads: any[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState<{ success: number; errors: number } | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setStats(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // This uses the API route we created earlier
      const res = await fetch('/api/admin/requests/bvn/upload-results', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setStats(data.stats);
      alert("File processed successfully.");
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Upload Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Select CSV File</h3>
          <p className="text-sm text-gray-500 mb-6">
            Please ensure the file is in .csv format and contains the standard NIBSS headers (TICKET_NUMBER, AGENT_CODE, etc).
          </p>
          
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isUploading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Upload & Process'}
          </button>

          {stats && (
            <div className="mt-6 bg-green-50 p-4 rounded-xl border border-green-100 flex justify-around">
              <div>
                <span className="block text-2xl font-bold text-green-700">{stats.success}</span>
                <span className="text-xs uppercase font-bold text-green-600">Updated</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-red-700">{stats.errors}</span>
                <span className="text-xs uppercase font-bold text-red-600">Skipped</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Records</h3>
          <p className="text-3xl font-extrabold text-gray-900 mt-2">{totalRecords.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Recently Updated</h3>
          <div className="space-y-3">
            {recentUploads.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                <span className="font-mono text-gray-600">{item.ticketNumber}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.status}
                </span>
              </div>
            ))}
            {recentUploads.length === 0 && <p className="text-sm text-gray-400">No records yet.</p>}
          </div>
        </div>
      </div>

    </div>
  );
}
