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
    <div className="w-64 bg-slate-900 dark:bg-slate-950 text-white h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50 transition-colors duration-200">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
          <HeartPulse className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">Heart Twin</span>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <img src={user?.avatarUrl} alt="User" className="w-8 h-8 rounded-full bg-slate-700 object-cover" />
            <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <div className="flex gap-2 text-xs text-slate-400 capitalize">
                    <span>{user?.role.toLowerCase()}</span>
                    {user?.patientId && <span className="text-blue-400 font-mono">#{user.patientId}</span>}
                </div>
            </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.id === 'messages' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
