"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon, 
  TrashIcon, 
  NoSymbolIcon,
  UserIcon
} from '@heroicons/react/24/outline';

// --- Custom Type for Chat Message ---
type ChatMessage = {
  id: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
  user: {
    firstName: string;
    lastName: string;
    businessName: string | null;
    role: string;
    email: string;
  };
};

// --- UPDATED Props: Use a loose type or pick specific fields ---
type Props = {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isChatBlocked?: boolean; // Optional because session might not have it yet
    businessName?: string | null;
  };
};

export default function CommunityChat({ currentUser }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPolling, setIsPolling] = useState(true);

  // --- Polling for new messages every 3 seconds ---
  useEffect(() => {
    if (!isOpen || !isPolling) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        if (data.messages) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Chat poll error", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isPolling]);

  // --- Scroll to bottom on new message ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      
      if (res.ok) {
        setNewMessage("");
        // Immediate fetch update
        // const data = await res.json(); // We rely on polling for now
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  // --- Admin Actions ---
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await fetch('/api/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm("Block this user from chatting?")) return;
    try {
      await fetch('/api/admin/chat/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block: true }),
      });
      alert("User blocked.");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* --- Chat Window --- */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-sm">Community Chat</h3>
                <p className="text-xs text-blue-100">Connect with other agents</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => {
              const isMe = msg.user.email === currentUser.email; 
              
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {!isMe && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    
                    <div className={`rounded-2xl p-3 text-sm shadow-sm ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : msg.isAdmin 
                          ? 'bg-purple-600 text-white rounded-bl-none' 
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}>
                      {/* Name Display */}
                      <p className={`text-xs font-bold mb-1 ${isMe || msg.isAdmin ? 'text-blue-100' : 'text-blue-600'}`}>
                        {msg.isAdmin ? 'Admin Support' : (msg.user.businessName || msg.user.firstName)}
                        
                        {/* Admin sees email */}
                        {currentUser.role === 'ADMIN' && !isMe && (
                          <span className="block text-[10px] font-normal opacity-70">{msg.user.email}</span>
                        )}
                      </p>
                      
                      {/* Message Body */}
                      <p>{msg.message}</p>
                    </div>
                  </div>
                  
                  {/* Admin Controls */}
                  {currentUser.role === 'ADMIN' && !isMe && !msg.isAdmin && (
                    <div className="flex gap-2 mt-1 ml-10">
                      <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-500 hover:text-red-700 text-[10px] flex items-center gap-1">
                        <TrashIcon className="h-3 w-3" /> Delete
                      </button>
                      <button onClick={() => handleBlockUser(msg.user.email)} className="text-gray-500 hover:text-gray-700 text-[10px] flex items-center gap-1">
                        <NoSymbolIcon className="h-3 w-3" /> Block
                      </button>
                    </div>
                  )}
                  
                  <span className="text-[10px] text-gray-400 mt-1 px-2">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200">
            {/* Optional Chaining in case isChatBlocked is undefined */}
            {currentUser?.isChatBlocked ? (
               <div className="text-center text-red-500 text-sm py-2 bg-red-50 rounded">
                 You have been blocked from chatting.
               </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  disabled={isSending}
                />
                <button 
                  type="submit" 
                  disabled={isSending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* --- Floating Button --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <XMarkIcon className="h-8 w-8" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-8 w-8" />
        )}
      </button>
    </div>
  );
}
