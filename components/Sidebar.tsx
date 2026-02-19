import React from 'react';
import { Activity, Users, Settings, LogOut, HeartPulse, Microscope, Dumbbell, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useApp();

  const menuItems = user?.role === UserRole.DOCTOR ? [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'simulation', label: 'Sim Lab', icon: Microscope },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] : [
    { id: 'dashboard', label: 'My Health', icon: HeartPulse },
    { id: 'fitness', label: 'Fitness Coach', icon: Dumbbell },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'chat', label: 'AI Assistant', icon: LayoutDashboard },
    { id: 'simulation', label: 'Sim Lab', icon: Microscope },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col shadow-2xl">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <HeartPulse className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">Heart Twin</span>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-white/5">
            <img src={user?.avatarUrl} alt="User" className="w-9 h-9 rounded-lg bg-slate-800 object-cover ring-2 ring-slate-800" />
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <div className="flex gap-2 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    <span>{user?.role.toLowerCase()}</span>
                </div>
            </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.id === 'messages' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};