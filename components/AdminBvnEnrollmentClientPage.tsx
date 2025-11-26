"use client";

import React, { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

type ResultItem = {
  id: string;
  ticketNumber: string;
  agentCode: string;
  status: string;
  message: string | null;
  updatedAt: string;
};

export default function AdminBvnEnrollmentClientPage({ 
  totalResults, 
  recentResults 
}: { 
  totalResults: number, 
  recentResults: ResultItem[] 
}) {
  
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ success: number, errors: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadStats(null); // Reset stats on new file select
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/requests/bvn/upload-results', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadStats(data.stats);
      alert(`Upload Complete! Processed: ${data.stats.success}, Errors: ${data.stats.errors}`);
      window.location.reload(); // Refresh to show new data

    } catch (error: any) {
      alert("Upload Failed: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="max-w-xl mx-auto text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <CloudArrowUpIcon className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Upload Enrollment Report</h2>
          <p className="text-sm text-gray-500 mb-6">
            Upload the CSV file exported from the BMS/NIBSS terminal. <br/>
            <span className="text-red-500 text-xs">Note: Convert Excel (.xlsx) to CSV before uploading.</span>
          </p>

          <div className="flex flex-col items-center gap-4">
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            
            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" /> Processing...
                </>
              ) : (
                "Upload & Process"
              )}
            </button>
          </div>

          {uploadStats && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{uploadStats.success}</p>
                <p className="text-xs text-gray-500 uppercase">Successful</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{uploadStats.errors}</p>
                <p className="text-xs text-gray-500 uppercase">Errors</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Recent Data Preview */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Updates</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ticket No.</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Agent Code</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentResults.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-xs font-mono text-gray-600">{row.ticketNumber}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.agentCode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold 
                        ${row.status === 'APPROVED' || row.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                          row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={row.message || ''}>
                      {row.message || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(row.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {recentResults.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p>No records found yet.</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500">
            Total Records in DB: {totalResults}
          </div>
        </div>
      </div>

    </div>
  );
}
