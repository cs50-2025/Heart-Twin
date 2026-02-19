import { FitnessLevel } from '../types';

export interface Exercise {
  id: string;
  name: string;
  duration: number; // seconds
  description: string;
  instruction: string;
  color: string;
}

export const WORKOUT_ROUTINES: Record<FitnessLevel, Exercise[]> = {
  'Easy': [
    { id: 'e1', name: 'Seated Marching', duration: 30, description: 'Low impact cardio', instruction: 'Sit tall and march legs up and down.', color: 'bg-emerald-500' },
    { id: 'e2', name: 'Arm Circles', duration: 30, description: 'Shoulder mobility', instruction: 'Extend arms and make small circles.', color: 'bg-teal-500' },
    { id: 'e3', name: 'Wall Push-ups', duration: 30, description: 'Upper body strength', instruction: 'Lean against wall and push back.', color: 'bg-green-500' },
    { id: 'e4', name: 'Toe Taps', duration: 30, description: 'Coordination', instruction: 'Tap toes forward one at a time.', color: 'bg-lime-500' },
    { id: 'e5', name: 'Side Bends', duration: 30, description: 'Core stretch', instruction: 'Gently bend torso side to side.', color: 'bg-emerald-600' },
    { id: 'e6', name: 'Calf Raises', duration: 30, description: 'Leg strength', instruction: 'Lift heels off ground and hold.', color: 'bg-green-600' },
  ],
  'Medium': [
    { id: 'm1', name: 'Jumping Jacks', duration: 45, description: 'Cardio boost', instruction: 'Jump feet apart and raise arms.', color: 'bg-blue-500' },
    { id: 'm2', name: 'Bodyweight Squats', duration: 45, description: 'Leg strength', instruction: 'Keep back straight, lower hips.', color: 'bg-indigo-500' },
    { id: 'm3', name: 'High Knees', duration: 30, description: 'High intensity', instruction: 'Run in place lifting knees high.', color: 'bg-violet-500' },
    { id: 'm4', name: 'Lunges', duration: 40, description: 'Leg balance', instruction: 'Step forward and lower knee.', color: 'bg-blue-600' },
    { id: 'm5', name: 'Push-ups', duration: 30, description: 'Chest strength', instruction: 'Standard push-up on floor or knees.', color: 'bg-indigo-600' },
    { id: 'm6', name: 'Plank', duration: 40, description: 'Core stability', instruction: 'Hold plank position on elbows.', color: 'bg-violet-600' },
  ],
  'Hard': [
    { id: 'h1', name: 'Burpees', duration: 45, description: 'Full body burn', instruction: 'Squat, kick back, push up, jump.', color: 'bg-rose-600' },
    { id: 'h2', name: 'Mountain Climbers', duration: 45, description: 'Core & Cardio', instruction: 'Plank position, drive knees to chest.', color: 'bg-red-600' },
    { id: 'h3', name: 'Plank Hold', duration: 60, description: 'Core stability', instruction: 'Hold straight line from head to heels.', color: 'bg-orange-600' },
    { id: 'h4', name: 'Jump Squats', duration: 40, description: 'Power', instruction: 'Squat down and jump up explosively.', color: 'bg-red-500' },
    { id: 'h5', name: 'Russian Twists', duration: 45, description: 'Obliques', instruction: 'Sit, lean back, twist torso.', color: 'bg-rose-500' },
    { id: 'h6', name: 'Push-up Jacks', duration: 40, description: 'Advanced chest', instruction: 'Push-up while jumping feet apart.', color: 'bg-orange-500' },
  ]
};