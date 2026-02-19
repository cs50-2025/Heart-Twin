import { Patient, User, UserRole, Vitals, WorkoutSession, FitnessLevel, Message, Notification, AppSettings } from '../types';
import { MOCK_PATIENTS, MOCK_ECG_DATA } from '../constants';
import { VideoDB } from './videoDB';

const STORAGE_KEYS = {
  USERS: 'ht_users',
  PATIENTS: 'ht_patients',
  CURRENT_USER: 'ht_current_session',
  MESSAGES: 'ht_messages',
  NOTIFICATIONS: 'ht_notifications',
  SETTINGS: 'ht_settings'
};

// Real-time communication channel across tabs
const channel = new BroadcastChannel('heart_twin_sync');

const notifyListeners = (type: string, payload?: any) => {
  channel.postMessage({ type, payload });
};

const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const doctorId = 'doc_1';
    
    const doctor: User = {
      id: doctorId,
      email: 'doctor@hearttwin.ai',
      name: 'Dr. Sarah Smith',
      password: 'password123', 
      role: UserRole.DOCTOR,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
    };

    // Seed mock patients
    const patients: Patient[] = MOCK_PATIENTS.map(p => ({
      ...p,
      doctorId: doctorId,
      fitnessLevel: 'Medium' as FitnessLevel,
      workoutHistory: [],
      hasNewActivity: false
    }));

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([doctor]));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

seedData();

export const StorageService = {
  // --- Auth (Name + Password) ---
  login: async (name: string, role: UserRole, password?: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Realism delay
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');

    if (role === UserRole.DOCTOR) {
        const user = users.find((u: User) => 
          u.name.toLowerCase() === name.toLowerCase() && 
          u.role === UserRole.DOCTOR
        );

        if (user && user.password === password) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        }
    } else {
        // Patient ID login
        const patient = patients.find((p: Patient) => p.id.toLowerCase() === name.toLowerCase());
        if (patient) {
            const patientUser: User = {
                id: `user_${patient.id}`,
                name: patient.name,
                email: patient.email,
                role: UserRole.PATIENT,
                patientId: patient.id,
                avatarUrl: patient.avatarUrl
            };
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(patientUser));
            return patientUser;
        }
    }
    return null;
  },

  registerDoctor: async (name: string, email: string, password?: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.find(u => u.email === email)) {
        throw new Error("User with this email already exists");
    }

    const newUser: User = {
      id: `doc_${Date.now()}`,
      name,
      email,
      password,
      role: UserRole.DOCTOR,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  },

  getUserById: (id: string): User | undefined => {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      return users.find(u => u.id === id);
  },

  // --- Settings ---
  getSettings: (): AppSettings => {
    const defaults: AppSettings = { darkMode: true, notifications: true, privacyMode: false, fontSize: 'md' };
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifyListeners('SETTINGS_UPDATE', settings);
  },

  // --- Messaging ---
  getMessages: (userId1: string, userId2: string): Message[] => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    return allMessages.filter(m => 
      (m.senderId === userId1 && m.receiverId === userId2) || 
      (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  sendMessage: async (message: Message) => {
    const allMessages: Message[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]');
    allMessages.push(message);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    
    // Notify Real-time listeners
    notifyListeners('MESSAGE_SENT', message);

    // Trigger notification for receiver
    const senderName = message.senderId.includes('doc') ? 'Dr. Smith' : 'Patient';
    StorageService.addNotification({
      id: `n-${Date.now()}`,
      userId: message.receiverId,
      title: 'New Message',
      message: `New message from ${senderName}`,
      type: 'info',
      read: false,
      timestamp: new Date().toISOString(),
      linkTo: 'messages'
    });
  },

  // --- Notifications ---
  getNotifications: (userId: string): Notification[] => {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    return all.filter(n => n.userId === userId).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  addNotification: (notification: Notification) => {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    all.push(notification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    notifyListeners('NEW_NOTIFICATION', notification);
  },

  markNotificationRead: (notifId: string) => {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const updated = all.map(n => n.id === notifId ? { ...n, read: true } : n);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    notifyListeners('NOTIFICATION_UPDATE');
  },

  clearNotifications: (userId: string) => {
    const all: Notification[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const filtered = all.filter(n => n.userId !== userId);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filtered));
    notifyListeners('NOTIFICATION_UPDATE');
  },

  // --- Patients ---
  getPatientsForDoctor: (doctorId: string): Patient[] => {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    return patients.filter((p: Patient) => p.doctorId === doctorId);
  },

  deletePatient: async (patientId: string) => {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const patientToDelete = patients.find((p: Patient) => p.id === patientId);
    
    if (patientToDelete && patientToDelete.workoutHistory) {
      for (const workout of patientToDelete.workoutHistory) {
        if (workout.videoUrl) {
          await VideoDB.deleteVideo(workout.videoUrl); 
        }
      }
    }

    const filteredPatients = patients.filter((p: Patient) => p.id !== patientId);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(filteredPatients));
    notifyListeners('PATIENT_UPDATE');
  },

  getPatientById: (patientId: string): Patient | undefined => {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    return patients.find((p: Patient) => p.id === patientId);
  },

  createPatient: async (patientData: Partial<Patient>, doctorId: string): Promise<Patient> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const simpleId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newPatient: Patient = {
      id: simpleId,
      doctorId,
      name: patientData.name || 'Unknown',
      age: patientData.age || 0,
      gender: patientData.gender || 'Other',
      email: `patient.${simpleId}@hearttwin.ai`,
      avatarUrl: `https://ui-avatars.com/api/?name=${patientData.name}&background=random&color=fff&background=0284c7`,
      riskScore: 0,
      lastVisit: new Date().toISOString().split('T')[0],
      fitnessLevel: patientData.fitnessLevel || 'Easy',
      vitals: {
        heartRate: 70, systolicBP: 120, diastolicBP: 80, cholesterol: 180, bloodSugar: 90, weight: 70, spO2: 98,
        ...patientData.vitals
      },
      history: [],
      ecgData: MOCK_ECG_DATA,
      workoutHistory: [],
      hasNewActivity: false
    };

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([...patients, newPatient]));
    notifyListeners('PATIENT_UPDATE');
    return newPatient;
  },

  updatePatientVitals: (patientId: string, vitals: Partial<Vitals>) => {
    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    const updatedPatients = patients.map((p: Patient) => {
      if (p.id === patientId) {
        return { ...p, vitals: { ...p.vitals, ...vitals } };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));
    notifyListeners('PATIENT_UPDATE');
  },

  saveWorkout: async (patientId: string, session: WorkoutSession, videoBlob?: Blob) => {
    let videoId = undefined;
    if (videoBlob) {
        videoId = `vid-${session.id}`;
        await VideoDB.saveVideo(videoId, videoBlob);
    }

    const sessionWithVideo = { ...session, videoUrl: videoId };

    const patients = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENTS) || '[]');
    let doctorId = '';
    
    const updatedPatients = patients.map((p: Patient) => {
      if (p.id === patientId) {
        doctorId = p.doctorId;
        return { 
          ...p, 
          workoutHistory: [sessionWithVideo, ...(p.workoutHistory || [])],
          hasNewActivity: true 
        };
      }
      return p;
    });
    
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(updatedPatients));
    
    if (doctorId) {
      const patient = updatedPatients.find((p: Patient) => p.id === patientId);
      StorageService.addNotification({
        id: `n-${Date.now()}`,
        userId: doctorId,
        title: 'Workout Completed',
        message: `${patient.name} completed a ${session.difficulty} workout. Video available.`,
        type: 'success',
        read: false,
        timestamp: new Date().toISOString(),
        linkTo: 'dashboard'
      });
    }

    notifyListeners('WORKOUT_SAVED', { patientId });
  }
};