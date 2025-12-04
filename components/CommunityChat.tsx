"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon, 
  TrashIcon, 
  NoSymbolIcon,
  CheckCircleIcon,
  UserIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

// --- Custom Type for Chat Message ---
type ChatMessage = {
  id: string;
  message: string;
  createdAt: string;
  isAdmin: boolean;
  user: {
    id: string; 
    firstName: string;
    lastName: string;
    businessName: string | null;
    role: string;
    email: string;
    isChatBlocked: boolean; // <--- Added this field
  };
};

type Props = {
  currentUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isChatBlocked?: boolean;
    businessName?: string | null;
  };
};

export default function CommunityChat({ currentUser }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [isChatLocked, setIsChatLocked] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Polling ---
  useEffect(() => {
    if (!isOpen || !isPolling) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        
        if (data.messages) {
          setMessages(data.messages);
        }
        if (typeof data.isLocked !== 'undefined') {
          setIsChatLocked(data.isLocked);
        }
      } catch (error) {
        console.error("Chat poll error", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => clearInterval(interval);
  }, [isOpen, isPolling]);

  // --- Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // --- Send Message ---
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

  // --- Delete Message ---
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

  // --- Block / Unblock User ---
  const handleToggleBlockUser = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "Unblock" : "Block";
    if (!confirm(`${action} this user from chatting?`)) return;
    
    try {
      const res = await fetch('/api/admin/chat/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block: !currentStatus }), // Toggle status
      });
      
      if (res.ok) {
          alert(`User ${action.toLowerCase()}ed.`);
      } else {
          alert(`Failed to ${action.toLowerCase()} user.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Toggle Lock Chat ---
  const handleToggleLock = async () => {
    const newLockStatus = !isChatLocked;
    const confirmMsg = newLockStatus 
      ? "Lock the chat? Only Admins will be able to talk." 
      : "Unlock the chat for everyone?";
      
    if (!confirm(confirmMsg)) return;

    try {
      setIsChatLocked(newLockStatus); 
      await fetch('/api/admin/chat/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: newLockStatus }),
      });
    } catch (err) {
      console.error(err);
      setIsChatLocked(!newLockStatus); 
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
                {isChatLocked ? (
                  <p className="text-xs text-red-200 font-semibold flex items-center gap-1">
                    <LockClosedIcon className="h-3 w-3" /> Locked by Admin
                  </p>
                ) : (
                  <p className="text-xs text-blue-100">Connect with other agents</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentUser.role === 'ADMIN' && (
                <button 
                  onClick={handleToggleLock}
                  className="p-1.5 rounded hover:bg-blue-700 transition-colors"
                  title={isChatLocked ? "Unlock Chat" : "Lock Chat"}
                >
                  {isChatLocked ? <LockClosedIcon className="h-5 w-5 text-red-300" /> : <LockOpenIcon className="h-5 w-5 text-blue-200" />}
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
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
                      <p className={`text-xs font-bold mb-1 ${isMe || msg.isAdmin ? 'text-blue-100' : 'text-blue-600'}`}>
                        {msg.isAdmin ? 'Admin Support' : (msg.user.businessName || msg.user.firstName)}
                        {/* Show blocked status to admin */}
                        {currentUser.role === 'ADMIN' && msg.user.isChatBlocked && (
                            <span className="ml-2 text-red-500 text-[10px] bg-white px-1 rounded uppercase font-bold">BLOCKED</span>
                        )}
                      </p>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                  
                  {/* Admin Controls */}
                  {currentUser.role === 'ADMIN' && !isMe && !msg.isAdmin && (
                    <div className="flex gap-2 mt-1 ml-10">
                      <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-500 hover:text-red-700 text-[10px] flex items-center gap-1">
                        <TrashIcon className="h-3 w-3" /> Delete
                      </button>
                      
                      {/* Toggle Block/Unblock */}
                      <button 
                        onClick={() => handleToggleBlockUser(msg.user.id, msg.user.isChatBlocked)} 
                        className={`${msg.user.isChatBlocked ? 'text-green-600' : 'text-gray-500'} hover:text-gray-900 text-[10px] flex items-center gap-1`}
                      >
                        {msg.user.isChatBlocked ? (
                            <><CheckCircleIcon className="h-3 w-3" /> Unblock</>
                        ) : (
                            <><NoSymbolIcon className="h-3 w-3" /> Block</>
                        )}
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
            {currentUser?.isChatBlocked ? (
               <div className="text-center text-red-500 text-sm py-2 bg-red-50 rounded">
                 You have been blocked from chatting.
               </div>
            ) : isChatLocked && currentUser.role !== 'ADMIN' ? (
              <div className="text-center text-gray-500 text-sm py-2 bg-gray-100 rounded flex items-center justify-center gap-2">
                 <LockClosedIcon className="h-4 w-4" /> Chat is currently locked by Admin.
               </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={isChatLocked ? "Chat is locked (Admin Override)..." : "Type a message..."}
                  className={`flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none 
                    ${isChatLocked ? 'bg-red-50 border-red-200 placeholder:text-red-300' : ''}`}
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

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? <XMarkIcon className="h-8 w-8" /> : <ChatBubbleLeftRightIcon className="h-8 w-8" />}
      </button>
    </div>
  );
}
