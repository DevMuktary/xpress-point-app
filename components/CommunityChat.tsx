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
  LockOpenIcon,
  ArrowUturnLeftIcon // Used for Reply
} from '@heroicons/react/24/outline';

// --- Updated Custom Type for Chat Message ---
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
    isChatBlocked: boolean; 
  };
  // Add Reply information
  replyTo?: {
    id: string;
    message: string;
    user: {
      firstName: string;
      businessName: string | null;
      role: string;
    }
  } | null;
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
  
  // New States for Features
  const [unreadCount, setUnreadCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [stickToBottom, setStickToBottom] = useState(true);

  // --- Reset Unread Count when opened ---
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setStickToBottom(true); // Force scroll to bottom on open
    }
  }, [isOpen]);

  // --- Polling ---
  useEffect(() => {
    // Poll even if closed to check for notifications, but maybe slower if you want
    if (!isPolling) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        
        if (data.messages) {
          setMessages(prev => {
            // Check for new messages to increment unread count
            const isNewMessage = data.messages.length > prev.length;
            const lastMsgId = data.messages[data.messages.length - 1]?.id;
            const prevLastId = prev[prev.length - 1]?.id;

            // Only increment badge if chat is CLOSED and it's actually a new message
            if (!isOpen && isNewMessage && lastMsgId !== prevLastId && prev.length > 0) {
               setUnreadCount(c => c + (data.messages.length - prev.length));
            }

            // Simple check to avoid re-renders if nothing changed
            if (prev.length !== data.messages.length || lastMsgId !== prevLastId) {
                return data.messages;
            }
            return prev;
          });
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
  }, [isPolling, isOpen]); // removed 'isOpen' dependency so it polls in background for notifications

  // --- Smart Scroll Logic ---
  useEffect(() => {
    if (scrollRef.current && (stickToBottom || messages.length === 0)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, stickToBottom, replyingTo]); // Scroll when replying UI opens too

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setStickToBottom(isAtBottom);
  };

  // --- Send Message ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    setStickToBottom(true);
    try {
      const payload = { 
        message: newMessage,
        replyToId: replyingTo?.id // Send the ID we are replying to
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setNewMessage("");
        setReplyingTo(null); // Clear reply state
        
        // Immediate fetch
        const fetchRes = await fetch('/api/chat');
        const fetchData = await fetchRes.json();
        if(fetchData.messages) setMessages(fetchData.messages);
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
    } catch (err) { console.error(err); }
  };

  // --- Block / Unblock ---
  const handleToggleBlockUser = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? "Unblock" : "Block";
    if (!confirm(`${action} this user?`)) return;
    try {
      await fetch('/api/admin/chat/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block: !currentStatus }),
      });
      alert(`User ${action}ed.`);
    } catch (err) { console.error(err); }
  };

  // --- Lock Chat ---
  const handleToggleLock = async () => {
    const newLockStatus = !isChatLocked;
    if (!confirm(newLockStatus ? "Lock chat?" : "Unlock chat?")) return;
    setIsChatLocked(newLockStatus); 
    try {
      await fetch('/api/admin/chat/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: newLockStatus }),
      });
    } catch (err) { setIsChatLocked(!newLockStatus); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-sm">Community Chat</h3>
                {isChatLocked ? (
                  <p className="text-xs text-red-200 font-semibold flex items-center gap-1">
                    <LockClosedIcon className="h-3 w-3" /> Locked by Admin
                  </p>
                ) : (
                  <p className="text-xs text-blue-100">Connect with agents</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {currentUser.role === 'ADMIN' && (
                <button 
                  onClick={handleToggleLock}
                  className="p-1.5 rounded hover:bg-blue-700 transition-colors"
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
          <div 
            ref={scrollRef} 
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((msg) => {
              const isMe = msg.user.email === currentUser.email;
              
              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
                  
                  {/* Message Bubble Container */}
                  <div className={`flex items-end gap-2 max-w-[90%] relative`}>
                    
                    {!isMe && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    
                    <div className={`flex flex-col`}>
                        {/* Render Name */}
                        <span className={`text-[10px] ml-1 mb-0.5 font-bold ${isMe ? 'text-right text-blue-600' : 'text-gray-600'}`}>
                            {msg.isAdmin ? 'Admin Support' : (msg.user.businessName || msg.user.firstName)}
                        </span>

                        <div className={`rounded-2xl p-3 text-sm shadow-sm relative ${
                        isMe 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : msg.isAdmin 
                            ? 'bg-purple-600 text-white rounded-bl-none' 
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                        }`}>
                        
                        {/* --- QUOTED REPLY BLOCK --- */}
                        {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded text-xs border-l-2 opacity-90 ${
                                isMe ? 'bg-blue-700 border-blue-300 text-blue-100' : 'bg-gray-100 border-gray-400 text-gray-600'
                            }`}>
                                <p className="font-bold text-[10px] mb-0.5">
                                    Reply to {msg.replyTo.user.role === 'ADMIN' ? 'Admin' : msg.replyTo.user.businessName || msg.replyTo.user.firstName}
                                </p>
                                <p className="truncate line-clamp-1 italic">"{msg.replyTo.message}"</p>
                            </div>
                        )}
                        {/* ------------------------- */}

                        <p>{msg.message}</p>
                        </div>
                    </div>
                  </div>
                  
                  {/* Action Bar (Time + Reply + Delete) */}
                  <div className={`flex items-center gap-3 mt-1 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[10px] text-gray-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* REPLY BUTTON - Visible to everyone */}
                    {!currentUser.isChatBlocked && (
                        <button 
                            onClick={() => setReplyingTo(msg)}
                            className="text-[10px] font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <ArrowUturnLeftIcon className="h-3 w-3" /> Reply
                        </button>
                    )}
                    
                    {/* ADMIN: Delete & Block */}
                    {currentUser.role === 'ADMIN' && !isMe && !msg.isAdmin && (
                        <>
                        <button onClick={() => handleDeleteMessage(msg.id)} className="text-red-500 hover:text-red-700 text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon className="h-3 w-3" /> Delete
                        </button>
                        <button onClick={() => handleToggleBlockUser(msg.user.id, msg.user.isChatBlocked)} className={`${msg.user.isChatBlocked ? 'text-green-600' : 'text-gray-500'} hover:text-gray-900 text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            {msg.user.isChatBlocked ? <CheckCircleIcon className="h-3 w-3" /> : <NoSymbolIcon className="h-3 w-3" />}
                        </button>
                        </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 shrink-0">
            
            {/* --- REPLY PREVIEW BANNER --- */}
            {replyingTo && (
                <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100 animate-in slide-in-from-bottom-2">
                    <div className="text-xs text-gray-600 overflow-hidden pr-4">
                        <span className="font-bold text-blue-600">Replying to {replyingTo.user.role === 'ADMIN' ? 'Admin' : replyingTo.user.firstName}:</span>
                        <span className="ml-1 opacity-70 truncate block">"{replyingTo.message}"</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>
            )}
            {/* --------------------------- */}

            <form onSubmit={handleSendMessage} className="p-3">
                {currentUser?.isChatBlocked ? (
                <div className="text-center text-red-500 text-sm py-2 bg-red-50 rounded">
                    You have been blocked.
                </div>
                ) : isChatLocked && currentUser.role !== 'ADMIN' ? (
                <div className="text-center text-gray-500 text-sm py-2 bg-gray-100 rounded flex items-center justify-center gap-2">
                    <LockClosedIcon className="h-4 w-4" /> Chat locked.
                </div>
                ) : (
                <div className="flex gap-2">
                    <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                    className={`flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none 
                        ${isChatLocked ? 'bg-red-50 border-red-200 placeholder:text-red-300' : ''}`}
                    disabled={isSending}
                    autoFocus={!!replyingTo}
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
        </div>
      )}

      {/* Main Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
      >
        {/* --- UNREAD BADGE --- */}
        {unreadCount > 0 && !isOpen && (
            <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[10px] font-bold animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
            </div>
        )}
        {/* -------------------- */}
        
        {isOpen ? <XMarkIcon className="h-8 w-8" /> : <ChatBubbleLeftRightIcon className="h-8 w-8" />}
      </button>
    </div>
  );
}
