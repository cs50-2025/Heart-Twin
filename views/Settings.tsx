import React from 'react';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { Moon, Sun, Bell, Shield, Type, Download, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { settings, updateSettings } = useApp();
  const { logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your preferences and security.</p>
      </header>

      <Card title="Appearance" className="dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              {settings.darkMode ? <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Sun className="w-5 h-5 text-indigo-600" />}
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Easier on the eyes in low light.</p>
            </div>
          </div>
          <button 
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </Card>

      <Card title="Notifications & Privacy" className="dark:bg-slate-800 dark:border-slate-700">
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                    <p className="font-medium text-slate-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive alerts about messages and vitals.</p>
                    </div>
                </div>
                <button 
                    onClick={() => updateSettings({ notifications: !settings.notifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                    <p className="font-medium text-slate-900 dark:text-white">Privacy Mode</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Hide patient names in dashboard summary.</p>
                    </div>
                </div>
                <button 
                    onClick={() => updateSettings({ privacyMode: !settings.privacyMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.privacyMode ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.privacyMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
      </Card>

      <Card title="Data & Accessibility" className="dark:bg-slate-800 dark:border-slate-700">
         <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                       <Type className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">Font Size</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Adjust the text density.</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    {(['sm', 'md', 'lg'] as const).map(size => (
                        <button
                            key={size}
                            onClick={() => updateSettings({ fontSize: size })}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${settings.fontSize === size ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                        >
                            {size.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                       <Download className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <p className="font-medium text-slate-900 dark:text-white">Export My Data</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Download a full archive of your records.</p>
                    </div>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    Request Archive
                </button>
            </div>
         </div>
      </Card>
      
      <div className="flex justify-center pt-8">
        <button onClick={logout} className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium px-6 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Sign Out Securely
        </button>
      </div>
    </div>
  );
};
