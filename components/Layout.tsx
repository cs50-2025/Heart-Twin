import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../context/AppContext';
import { Bell, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { notifications, unreadCount, markNotificationRead, clearAllNotifications } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617]"></div>
      </div>

      {/* Floating Sidebar Container */}
      <div className="relative z-20 h-screen py-4 pl-4">
          <Sidebar currentView={currentView} onChangeView={onViewChange} />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        
        {/* Top Navigation Bar - Floating Glass */}
        <div className="px-8 py-4 z-40">
            <div className="h-16 rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl flex items-center justify-between px-6 shadow-xl shadow-black/20">
                {/* Breadcrumb / Title */}
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm">/</span>
                    <h2 className="text-lg font-bold text-white capitalize tracking-wide">
                        {currentView.replace('-', ' ')}
                    </h2>
                </div>

                <div className="flex items-center gap-6">
                    {/* Search Bar Visual */}
                    <div className="hidden md:flex items-center bg-slate-950/50 border border-slate-800 rounded-full px-4 py-1.5 w-64">
                        <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                        <input 
                            type="text" 
                            placeholder="Quick search..." 
                            className="bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none w-full font-medium"
                        />
                    </div>

                    <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

                    {/* Notification Bell */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowNotifs(!showNotifs)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all relative group"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-blue rounded-full border border-slate-900 shadow-[0_0_8px_rgba(0,243,255,0.6)] animate-pulse"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifs && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
                                <div className="absolute right-0 mt-4 w-80 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden animate-fade-in origin-top-right">
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                        <h3 className="font-semibold text-white">Notifications</h3>
                                        {notifications.length > 0 && (
                                            <button onClick={clearAllNotifications} className="text-xs text-neon-blue hover:text-cyan-300">Clear all</button>
                                        )}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-500 text-sm">
                                                All systems nominal.
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id}
                                                    onClick={() => {
                                                        markNotificationRead(notif.id);
                                                        if(notif.linkTo) {
                                                            onViewChange(notif.linkTo);
                                                            setShowNotifs(false);
                                                        }
                                                    }}
                                                    className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-500/5' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!notif.read ? 'bg-neon-blue shadow-[0_0_5px_rgba(0,243,255,0.5)]' : 'bg-slate-600'}`}></div>
                                                        <div>
                                                            <p className={`text-sm ${!notif.read ? 'font-semibold text-white' : 'text-slate-400'}`}>{notif.title}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                            <p className="text-[10px] text-slate-600 mt-2 font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="flex-1 p-8 pt-0 overflow-y-auto scroll-smooth custom-scrollbar">
            <div className="max-w-7xl mx-auto h-full">
               {children}
            </div>
        </div>
      </main>
    </div>
  );
};