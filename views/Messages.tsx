import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storage';
import { Message, UserRole, User } from '../types';
import { Send, Search, CheckCheck } from 'lucide-react';

export const Messages = () => {
  const { user } = useAuth();
  const { patients, lastMessageUpdate } = useApp();
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contacts, setContacts] = useState<{ id: string, name: string, avatar: string, role: string }[]>([]);

  // Dynamically derive contacts
  useEffect(() => {
      if (!user) return;

      if (user.role === UserRole.DOCTOR) {
          // Doctors see all their patients
          const patientContacts = patients.map(p => ({ 
              id: `user_${p.id}`, 
              name: p.name, 
              avatar: p.avatarUrl, 
              role: 'Patient' 
          }));
          setContacts(patientContacts);
      } else {
          // Patients see their specific doctor
          // 'patients' array in context for a patient user contains their own record
          const myRecord = patients[0];
          if (myRecord) {
              const doctorUser = StorageService.getUserById(myRecord.doctorId);
              if (doctorUser) {
                  setContacts([{
                      id: doctorUser.id,
                      name: doctorUser.name,
                      avatar: doctorUser.avatarUrl || 'https://ui-avatars.com/api/?name=Doctor&background=random',
                      role: 'Cardiologist'
                  }]);
              } else {
                  // Fallback if doctor record missing
                  setContacts([{ 
                      id: 'doc_1', 
                      name: 'Dr. Sarah Smith', 
                      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200', 
                      role: 'Cardiologist' 
                  }]);
              }
          }
      }
  }, [user, patients]);

  useEffect(() => {
    if (contacts.length > 0 && !activeContactId) {
        setActiveContactId(contacts[0].id);
    }
  }, [contacts]);

  // Real-time Message Sync using Context Signal
  useEffect(() => {
    if (user && activeContactId) {
        setMessages(StorageService.getMessages(user.id, activeContactId));
    }
  }, [user, activeContactId, lastMessageUpdate]); // Updates whenever context signals a new message

  useEffect(() => {
      if(scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !activeContactId) return;

    const newMsg: Message = {
        id: `m-${Date.now()}`,
        senderId: user.id,
        receiverId: activeContactId,
        text: messageText,
        timestamp: new Date().toISOString(),
        read: false
    };

    // This will trigger the broadcast channel, which updates lastMessageUpdate, causing re-render
    await StorageService.sendMessage(newMsg);
    // Optimistic update
    setMessages([...messages, newMsg]);
    setMessageText('');
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-2rem)] flex bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xl">
        {/* Contact List */}
        <div className="w-80 border-r border-slate-100 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        placeholder="Search contacts..." 
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {contacts.map(contact => (
                    <div 
                        key={contact.id}
                        onClick={() => setActiveContactId(contact.id)}
                        className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${activeContactId === contact.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <div className="relative">
                            <img src={contact.avatar} className="w-10 h-10 rounded-full object-cover" alt={contact.name} />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">{contact.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{contact.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
            {activeContactId ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src={contacts.find(c => c.id === activeContactId)?.avatar} className="w-8 h-8 rounded-full" />
                            <h3 className="font-bold text-slate-900 dark:text-white">{contacts.find(c => c.id === activeContactId)?.name}</h3>
                        </div>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                             <span className="text-xs text-slate-500">Active Now</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 my-10">No messages yet. Start the conversation!</div>
                        )}
                        {messages.map((msg) => {
                            const isMe = msg.senderId === user.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 rounded-tl-none shadow-sm'}`}>
                                        <p>{msg.text}</p>
                                        <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            {isMe && <CheckCheck className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input 
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white"
                            />
                            <button 
                                type="submit" 
                                disabled={!messageText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    Select a contact to start messaging
                </div>
            )}
        </div>
    </div>
  );
};