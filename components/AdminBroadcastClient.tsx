"use client";

import React, { useState } from 'react';
import { EnvelopeIcon, SpeakerWaveIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Loading from '@/app/loading';

type Props = {
  initialBanner: string;
};

export default function AdminBroadcastClient({ initialBanner }: Props) {
  const [activeTab, setActiveTab] = useState<'EMAIL' | 'BANNER'>('EMAIL');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Email State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Banner State
  const [bannerContent, setBannerContent] = useState(initialBanner);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to email ALL users?")) return;
    
    setIsLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, htmlMessage: emailBody }),
      });
      if (res.ok) {
        setSuccessMsg("Emails have been queued for sending!");
        setEmailSubject('');
        setEmailBody('');
      } else {
        alert("Failed to send emails.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/system/banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: bannerContent }),
      });
      if (res.ok) {
        setSuccessMsg("Dashboard banner updated successfully!");
      } else {
        alert("Failed to update banner.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && <Loading />}
      
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <CheckCircleIcon className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        <button
          onClick={() => setActiveTab('EMAIL')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'EMAIL' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Email Broadcast
        </button>
        <button
          onClick={() => setActiveTab('BANNER')}
          className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'BANNER' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Dashboard Banner
        </button>
      </div>

      {/* --- Email Form --- */}
      {activeTab === 'EMAIL' && (
        <div className="bg-white p-6 rounded-b-2xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
              Send Mass Email
            </h2>
            <p className="text-sm text-gray-500">This will send an email to <strong>EVERY</strong> registered user.</p>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Subject</label>
              <input 
                type="text" 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:ring-blue-500"
                placeholder="e.g. Important Update: New Service Added!"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                HTML Message Body 
                <span className="text-xs text-gray-400 ml-2">(Supports HTML & CSS)</span>
              </label>
              <textarea 
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:ring-blue-500 font-mono text-sm"
                placeholder="<p>Hello Agents,</p><br/><strong>We have updated...</strong>"
                required
              />
            </div>
            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Send Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Banner Form --- */}
      {activeTab === 'BANNER' && (
        <div className="bg-white p-6 rounded-b-2xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <SpeakerWaveIcon className="h-6 w-6 text-purple-600" />
              Update Dashboard Banner
            </h2>
            <p className="text-sm text-gray-500">This content will appear at the top of every user's dashboard.</p>
          </div>

          <form onSubmit={handleUpdateBanner} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Banner Content (HTML)
                <span className="text-xs text-gray-400 ml-2">(Leave empty to remove banner)</span>
              </label>
              <textarea 
                value={bannerContent}
                onChange={(e) => setBannerContent(e.target.value)}
                rows={6}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 focus:ring-purple-500 font-mono text-sm"
                placeholder="<h3 class='text-lg font-bold'>Welcome!</h3><p>Join our WhatsApp group...</p>"
              />
            </div>
            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Save Banner
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-2">Preview:</p>
            <div className="p-4 bg-gray-50 rounded border border-dashed border-gray-300">
               <div dangerouslySetInnerHTML={{ __html: bannerContent }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
