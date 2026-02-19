export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT'
}

export type FitnessLevel = 'Easy' | 'Medium' | 'Hard';

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  privacyMode: boolean;
  fontSize: 'sm' | 'md' | 'lg';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  timestamp: string;
  linkTo?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface User {
  id: string;
  email: string; // Kept for internal ID structure, but login uses name
  name: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  patientId?: string;
}

export interface Vitals {
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  cholesterol: number;
  bloodSugar: number;
  weight: number;
  spO2: number;
}

export interface ECGDataPoint {
  time: number;
  voltage: number;
}

export interface WorkoutSession {
  id: string;
  patientId: string;
  date: string;
  durationSeconds: number;
  difficulty: FitnessLevel;
  exercisesCompleted: string[];
  videoUrl?: string; // Base64 string for persistence
  aiFeedback: string;
}

export interface Patient {
  id: string;
  doctorId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  avatarUrl: string;
  riskScore: number;
  lastVisit: string;
  vitals: Vitals;
  fitnessLevel: FitnessLevel;
  history: string[];
  ecgData: ECGDataPoint[];
  email: string;
  workoutHistory: WorkoutSession[];
  hasNewActivity?: boolean;
}

export interface AIAnalysisResult {
  riskScore: number;
  summary: string;
  recommendations: string[];
  simulationOutcome?: string;
}

export interface SimulationParams {
  weightChange: number;
  exerciseMinutes: number;
  quitSmoking: boolean;
  medicationAdherence: number;
}
