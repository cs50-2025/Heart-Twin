import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useApp } from '../context/AppContext';
import { Bell, Search, Check } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { notifications, unreadCount, markNotificationRead, clearAllNotifications } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Sidebar currentView={currentView} onChangeView={onViewChange} />
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navigation Bar */}
        <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 z-40">
            {/* Breadcrumb / Title */}
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white capitalize">
                {currentView.replace('-', ' ')}
            </h2>

            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifs(!showNotifs)}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifs && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)}></div>
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-fade-in">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                    {notifications.length > 0 && (
                                        <button onClick={clearAllNotifications} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Clear all</button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                            No new notifications.
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
                                                className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                    <div>
                                                        <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{notif.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                        <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.timestamp).toLocaleTimeString()}</p>
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

        <div className="flex-1 p-8 overflow-y-auto scroll-smooth">
            <div className="max-w-7xl mx-auto h-full">
               {children}
            </div>
        </div>
      </main>
    </div>
  );
};
