import React from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { ECGChart } from '../components/ECGChart';
import { Heart, Activity, TrendingUp, Calendar, Trophy, Footprints, Flame, Play, Dumbbell, Phone } from 'lucide-react';
import { Button } from '../components/Button';

export const PatientDashboard = () => {
  const { patients } = useApp();
  const me = patients[0]; 

  if (!me) return (
      <div className="flex h-full items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
  );

  return (
    <div className="space-y-8 pb-8">
      <header className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Good Morning, {me.name.split(' ')[0]}</h1>
            <p className="text-slate-500 mt-1">Your cardiovascular status is updated.</p>
        </div>
        <div className="flex flex-col items-end gap-4">
             <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Workout Streak</p>
                <div className="flex items-center gap-2 justify-end">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-slate-900">12 Days</span>
                </div>
            </div>
            <Button onClick={() => alert("Initiating secure voice channel with Dr. Smith...")} size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 border-none text-white shadow-lg shadow-emerald-500/30">
                <Phone className="w-4 h-4 mr-2" /> Voice Call
            </Button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl shadow-blue-900/20 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-blue-200 font-medium mb-1 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Current Status
              </p>
              <h2 className="text-4xl font-bold tracking-tight">Stable</h2>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-center">
              <span className="text-2xl font-bold">{me.riskScore}%</span>
              <p className="text-xs text-blue-200 uppercase tracking-wide">AI Risk Score</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 relative z-10">
             <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-2 font-semibold">Heart Rate</p>
                <p className="text-2xl font-bold">{me.vitals.heartRate} <span className="text-sm font-normal opacity-70">bpm</span></p>
             </div>
             <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-2 font-semibold">BP</p>
                <p className="text-2xl font-bold">{me.vitals.systolicBP}/{me.vitals.diastolicBP}</p>
             </div>
             <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-2 font-semibold">Cholesterol</p>
                <p className="text-2xl font-bold">{me.vitals.cholesterol}</p>
             </div>
             <div>
                <p className="text-blue-200 text-xs uppercase tracking-wider mb-2 font-semibold">SpO2</p>
                <p className="text-2xl font-bold">{me.vitals.spO2}%</p>
             </div>
          </div>
        </Card>

        {/* Start Workout Call to Action */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-lg shadow-slate-900/20">
             <div className="absolute top-0 right-0 p-6 opacity-20">
                 <Dumbbell className="w-24 h-24 rotate-[-15deg]" />
             </div>
             <div>
                 <p className="text-slate-400 text-sm font-medium mb-1">Today's Plan</p>
                 <h3 className="text-xl font-bold mb-2">Morning Cardio</h3>
                 <span className="px-2 py-1 bg-white/20 rounded text-xs font-semibold">{me.fitnessLevel} Level</span>
             </div>
             
             <div className="mt-4">
                 <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
                     <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString()}
                 </div>
                 {/* This button doesn't navigate directly in this component but visually guides user to sidebar */}
                 <div className="w-full py-2 bg-blue-600 rounded-lg text-center font-medium cursor-pointer hover:bg-blue-500 transition-colors">
                    Go to Fitness Coach
                 </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Latest ECG Reading">
            <div className="py-4">
              <ECGChart data={me.ecgData} color="#2563eb" height={220} />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
           <Card title="Activity Log">
             {me.workoutHistory && me.workoutHistory.length > 0 ? (
                 <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                     {me.workoutHistory.map((w, i) => (
                         <div key={i} className="flex gap-3 items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                             <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                 <Play className="w-4 h-4 text-green-600 ml-0.5" />
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-slate-800">{w.difficulty} Workout</p>
                                 <p className="text-xs text-slate-500">{new Date(w.date).toLocaleDateString()}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="text-center py-8 text-slate-400">
                     No workouts recorded yet.
                 </div>
             )}
           </Card>
        </div>
      </div>
    </div>
  );
};
