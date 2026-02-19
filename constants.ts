import { Patient, ECGDataPoint, Vitals } from './types';

export const MOCK_ECG_DATA: ECGDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
  time: i,
  voltage: Math.sin(i * 0.2) + (i % 20 === 0 ? 1.5 : 0) + (Math.random() * 0.1)
}));

export const INITIAL_VITALS: Vitals = {
  heartRate: 72,
  systolicBP: 120,
  diastolicBP: 80,
  cholesterol: 190,
  bloodSugar: 95,
  weight: 80,
  spO2: 98
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    doctorId: 'doc_1',
    name: 'Eleanor Rigby',
    age: 64,
    gender: 'Female',
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    riskScore: 65,
    lastVisit: '2023-10-24',
    vitals: { ...INITIAL_VITALS, systolicBP: 145, cholesterol: 240 },
    history: ['Hypertension', 'Family history of CAD'],
    ecgData: MOCK_ECG_DATA,
    email: 'eleanor.rigby@example.com',
    fitnessLevel: 'Easy',
    workoutHistory: []
  },
  {
    id: 'p2',
    doctorId: 'doc_1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    riskScore: 30,
    lastVisit: '2023-11-02',
    vitals: { ...INITIAL_VITALS, weight: 85 },
    history: ['None'],
    ecgData: MOCK_ECG_DATA,
    email: 'john.doe@example.com',
    fitnessLevel: 'Medium',
    workoutHistory: []
  },
  {
    id: 'p3',
    doctorId: 'doc_1',
    name: 'Sarah Connor',
    age: 38,
    gender: 'Female',
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    riskScore: 12,
    lastVisit: '2023-11-15',
    vitals: { ...INITIAL_VITALS, heartRate: 55 }, // Athlete
    history: ['Asthma'],
    ecgData: MOCK_ECG_DATA,
    email: 'sarah.connor@example.com',
    fitnessLevel: 'Hard',
    workoutHistory: []
  }
];