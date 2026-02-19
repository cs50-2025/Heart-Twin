import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, Patient, Vitals, Notification, AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface AppContextType {
  patients: Patient[];
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  updatePatientVitals: (patientId: string, newVitals: Partial<Vitals>) => void;
  addPatient: (patient: Partial<Patient>) => Promise<void>;
  removePatient: (patientId: string) => Promise<void>;
  refreshPatients: () => void;
  isLoading: boolean;
  
  // Settings & Notifications
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
  lastMessageUpdate: number; // Signal for Messages view
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastMessageUpdate, setLastMessageUpdate] = useState(Date.now());

  // Apply Settings Logic
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Dark Mode
    if (settings.darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Font Size
    body.classList.remove('text-sm', 'text-base', 'text-lg');
    if (settings.fontSize === 'sm') body.classList.add('text-sm');
    if (settings.fontSize === 'md') body.classList.add('text-base');
    if (settings.fontSize === 'lg') body.classList.add('text-lg');

  }, [settings]);

  const fetchPatients = () => {
    if (!user) return;
    // setIsLoading(true); // Can cause flickering on real-time updates
    let data: Patient[] = [];
    if (user.role === UserRole.DOCTOR) {
      data = StorageService.getPatientsForDoctor(user.id);
    } else if (user.role === UserRole.PATIENT && user.patientId) {
      const p = StorageService.getPatientById(user.patientId);
      data = p ? [p] : [];
    }
    setPatients(data);
    
    // Sync active patient
    if (activePatient) {
        const updatedActive = data.find(p => p.id === activePatient.id);
        if (updatedActive) setActivePatient(updatedActive);
        else setActivePatient(null);
    }
    // setIsLoading(false);
  };

  const fetchNotifications = () => {
    if (user) {
      setNotifications(StorageService.getNotifications(user.id));
    }
  };

  // Real-time Listener
  useEffect(() => {
    const channel = new BroadcastChannel('heart_twin_sync');
    
    channel.onmessage = (event) => {
        const { type, payload } = event.data;
        // console.log("Received Broadcast:", type, payload); // Debug
        
        switch(type) {
            case 'MESSAGE_SENT':
                setLastMessageUpdate(Date.now());
                fetchNotifications();
                break;
            case 'NEW_NOTIFICATION':
            case 'NOTIFICATION_UPDATE':
                fetchNotifications();
                break;
            case 'SETTINGS_UPDATE':
                setSettings(payload); // Updates UI instantly
                break;
            case 'PATIENT_UPDATE':
            case 'WORKOUT_SAVED':
                fetchPatients();
                break;
            default:
                break;
        }
    };

    return () => channel.close();
  }, [user]);

  useEffect(() => {
    fetchPatients();
    fetchNotifications();
  }, [user]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated); // Optimistic UI update
    StorageService.saveSettings(updated);
  };

  const handleSetActivePatient = (patient: Patient | null) => {
    setActivePatient(patient);
  };

  const updatePatientVitals = (patientId: string, newVitals: Partial<Vitals>) => {
    StorageService.updatePatientVitals(patientId, newVitals);
    // fetchPatients handled by broadcast listener usually, but here immediate
    fetchPatients();
  };

  const addPatient = async (patientData: Partial<Patient>) => {
    if (user?.role !== UserRole.DOCTOR) return;
    setIsLoading(true);
    await StorageService.createPatient(patientData, user.id);
    setIsLoading(false);
  };

  const removePatient = async (patientId: string) => {
    if (user?.role !== UserRole.DOCTOR) return;
    setIsLoading(true);
    await StorageService.deletePatient(patientId);
    if (activePatient?.id === patientId) setActivePatient(null);
    setIsLoading(false);
  };

  const markNotificationRead = (id: string) => {
    StorageService.markNotificationRead(id);
    fetchNotifications();
  };

  const clearAllNotifications = () => {
    if (user) {
      StorageService.clearNotifications(user.id);
      fetchNotifications();
    }
  };

  return (
    <AppContext.Provider value={{
      patients,
      activePatient,
      setActivePatient: handleSetActivePatient,
      updatePatientVitals,
      addPatient,
      removePatient,
      refreshPatients: fetchPatients,
      isLoading,
      settings,
      updateSettings,
      notifications,
      markNotificationRead,
      clearAllNotifications,
      unreadCount: notifications.filter(n => !n.read).length,
      lastMessageUpdate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
