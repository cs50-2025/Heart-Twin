import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ECGChart } from '../components/ECGChart';
import { analyzePatientRisk } from '../services/geminiService';
import { AIAnalysisResult, Patient, FitnessLevel, WorkoutSession } from '../types';
import { VideoDB } from '../services/videoDB';
import { Activity, Search, BrainCircuit, Plus, X, Stethoscope, CheckCircle2, Video, Dumbbell, Trash2, AlertTriangle, Download, Play, Pause, FastForward, Rewind, ChevronRight, ChevronLeft, FileText } from 'lucide-react';

export const DoctorDashboard = () => {
  const { patients, activePatient, setActivePatient, isLoading, addPatient, removePatient } = useApp();
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', age: '', gender: 'Male', fitnessLevel: 'Easy', cholesterol: 180, spO2: 98, systolicBP: 120, diastolicBP: 80, heartRate: 70 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Video Player State
  const [playingVideo, setPlayingVideo] = useState<{ url: string, session: WorkoutSession } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patient: Patient) => {
    setActivePatient(patient);
    setAnalysis(null);
  };

  const handleRunAnalysis = async () => {
    if (!activePatient) return;
    setIsAnalyzing(true);
    const result = await analyzePatientRisk(activePatient);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const confirmDelete = async () => {
    if (deleteId) {
        await removePatient(deleteId);
        setDeleteId(null);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientForm.name || !newPatientForm.age) return;
    
    await addPatient({
        name: newPatientForm.name,
        age: parseInt(newPatientForm.age as any),
        gender: newPatientForm.gender as any,
        fitnessLevel: newPatientForm.fitnessLevel as FitnessLevel,
        vitals: {
            heartRate: Number(newPatientForm.heartRate),
            systolicBP: Number(newPatientForm.systolicBP),
            diastolicBP: Number(newPatientForm.diastolicBP),
            cholesterol: Number(newPatientForm.cholesterol),
            bloodSugar: 90, 
            weight: 70, 
            spO2: Number(newPatientForm.spO2)
        }
    });
    setIsModalOpen(false);
    setNewPatientForm({ name: '', age: '', gender: 'Male', fitnessLevel: 'Easy', cholesterol: 180, spO2: 98, systolicBP: 120, diastolicBP: 80, heartRate: 70 });
  };

  const handleWatchVideo = async (session: WorkoutSession) => {
      if (session.videoUrl) {
          const blob = await VideoDB.getVideo(session.videoUrl);
          if (blob) {
              const url = URL.createObjectURL(blob);
              setPlayingVideo({ url, session });
              setIsPlaying(true); // Auto play
          } else {
              alert("Video file not found locally.");
          }
      }
  };

  const closeVideo = () => {
      if (playingVideo) {
          URL.revokeObjectURL(playingVideo.url);
          setPlayingVideo(null);
          setPlaybackRate(1);
          setIsPlaying(false);
      }
  };

  // Video Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const changeSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const exportReport = () => {
    if (!activePatient) return;
    const content = `HEART TWIN AI REPORT\nPatient: ${activePatient.name}\nID: ${activePatient.id}\nDate: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ECG_Report_${activePatient.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-2rem)]">
      {/* Patient List Column */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-white tracking-tight">My Patients</h2>
            <Button size="sm" onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none">
                <Plus className="w-4 h-4 mr-1" /> Add New
            </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-neon-blue focus:outline-none text-white placeholder-slate-500 backdrop-blur-sm transition-all"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 pb-4 custom-scrollbar">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
                <p>No patients found.</p>
            </div>
          ) : filteredPatients.map(patient => (
            <div 
              key={patient.id}
              onClick={() => handlePatientSelect(patient)}
              className={`p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden ${
                activePatient?.id === patient.id 
                  ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                    <img src={patient.avatarUrl} alt={patient.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    {patient.hasNewActivity && (
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border border-slate-900 animate-pulse" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className={`font-semibold truncate ${activePatient?.id === patient.id ? 'text-white' : 'text-slate-200'}`}>{patient.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">ID: {patient.id.toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    patient.riskScore > 70 ? 'bg-red-500/20 text-red-400' :
                    patient.riskScore > 30 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    Risk: {patient.riskScore}%
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteId(patient.id); }}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Column */}
      <div className="col-span-12 lg:col-span-8 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
        {activePatient ? (
          <div className="space-y-6 pb-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between glass-panel p-6 rounded-2xl">
              <div>
                <div className="flex items-center gap-3 mb-1">
                   <h2 className="text-3xl font-bold text-white">{activePatient.name}</h2>
                   <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-mono border border-slate-600">{activePatient.id}</span>
                </div>
                <div className="flex gap-6 text-slate-400 text-sm mt-3">
                    <span className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-neon-blue" /> {activePatient.age} Years</span>
                    <span className="flex items-center gap-2"><Dumbbell className="w-4 h-4 text-neon-purple" /> {activePatient.fitnessLevel}</span>
                    <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-neon-green" /> Last Visit: {activePatient.lastVisit}</span>
                </div>
              </div>
              <Button onClick={handleRunAnalysis} isLoading={isAnalyzing} disabled={isAnalyzing} className="bg-indigo-600 hover:bg-indigo-500 border-none shadow-lg shadow-indigo-900/40">
                <BrainCircuit className="w-4 h-4 mr-2" />
                AI Risk Assessment
              </Button>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="flex flex-col items-center justify-center py-6 bg-slate-800/50 border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Heart Rate</span>
                <span className="text-3xl font-bold text-white">{activePatient.vitals.heartRate} <span className="text-sm font-normal text-slate-500">bpm</span></span>
              </Card>
              <Card className="flex flex-col items-center justify-center py-6 bg-slate-800/50 border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Blood Pressure</span>
                <span className="text-3xl font-bold text-white">{activePatient.vitals.systolicBP}/{activePatient.vitals.diastolicBP}</span>
              </Card>
              <Card className="flex flex-col items-center justify-center py-6 bg-slate-800/50 border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cholesterol</span>
                <span className="text-3xl font-bold text-white">{activePatient.vitals.cholesterol}</span>
              </Card>
              <Card className="flex flex-col items-center justify-center py-6 bg-slate-800/50 border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">SpO2</span>
                <span className="text-3xl font-bold text-white">{activePatient.vitals.spO2}%</span>
              </Card>
            </div>

            {/* AI Report */}
            {analysis && (
              <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <BrainCircuit className="w-32 h-32" />
                  </div>
                  <div className="flex items-start gap-5 relative z-10">
                    <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                      <BrainCircuit className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg text-white">Clinical AI Insights</h3>
                        <span className="text-xs font-mono bg-indigo-950 px-2 py-1 rounded text-indigo-300 border border-indigo-500/30">GEMINI-PRO ANALYSIS</span>
                      </div>
                      <p className="text-indigo-100 mb-6 leading-relaxed opacity-90">{analysis.summary}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-indigo-950/50 rounded-xl p-4 border border-indigo-500/20">
                          <span className="text-xs font-semibold text-indigo-300 uppercase">Calculated Risk Score</span>
                          <div className="text-4xl font-bold mt-1 text-white">{analysis.riskScore}%</div>
                        </div>
                        <div className="space-y-3">
                           {analysis.recommendations.slice(0, 3).map((rec, i) => (
                             <div key={i} className="flex items-start gap-3 text-sm text-indigo-100">
                               <CheckCircle2 className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                               {rec}
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ECG Section */}
            <Card title="Real-time ECG Monitoring" action={<Button onClick={exportReport} variant="secondary" size="sm" className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"><FileText className="w-4 h-4 mr-2" /> Export PDF</Button>} className="bg-slate-800/40 border-slate-700">
              <div className="mb-4">
                 <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
                        <span className="text-xs font-mono text-neon-green">LIVE SIGNAL • LEAD II</span>
                     </div>
                 </div>
                 <div className="bg-yellow-900/20 border border-yellow-700/50 p-3 rounded-lg flex items-center gap-3 text-yellow-200 text-sm mb-4">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500" />
                    <span className="font-medium">WARNING: Simulated data. Not for clinical diagnosis.</span>
                 </div>
                 <ECGChart data={activePatient.ecgData} height={250} color="#0aff68" />
              </div>
            </Card>

            {/* Workout Activity Feed */}
            <Card title="Patient Activity History" className="bg-slate-800/40 border-slate-700">
                 {activePatient.workoutHistory && activePatient.workoutHistory.length > 0 ? (
                    <div className="space-y-4">
                        {activePatient.workoutHistory.map((workout, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center shrink-0 border border-blue-500/20">
                                    <Video className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold text-white">Completed {workout.difficulty} Workout</h4>
                                        <span className="text-xs text-slate-500">{new Date(workout.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">Duration: {Math.floor(workout.durationSeconds/60)} min • Exercises: {workout.exercisesCompleted.length}</p>
                                    
                                    {workout.videoUrl && (
                                        <button 
                                          onClick={() => handleWatchVideo(workout)}
                                          className="mt-3 flex items-center gap-2 text-sm text-neon-blue hover:text-cyan-300 font-medium transition-colors px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20"
                                        >
                                          <Play className="w-3 h-3 fill-current" /> Watch Recording
                                        </button>
                                    )}

                                    {workout.aiFeedback && (
                                        <div className="mt-2 p-3 bg-slate-900/50 text-slate-300 text-xs rounded-lg border border-slate-700/50 italic">
                                            <span className="font-bold text-neon-purple not-italic">AI Coach:</span> "{workout.aiFeedback}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-8 text-slate-500">No workout activity recorded yet.</div>
                 )}
            </Card>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-800/20 rounded-3xl border border-slate-700/50 m-4 border-dashed">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                 <Activity className="w-10 h-10 text-slate-600" />
            </div>
            <p className="text-xl font-medium text-slate-300">No Patient Selected</p>
            <p className="text-slate-500">Select a patient from the sidebar</p>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* Delete Confirmation Modal */}
      {deleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-700">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500 mx-auto">
                      <Trash2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-white mb-2">Delete Patient Record?</h3>
                  <p className="text-center text-slate-400 mb-6">
                      This action is <span className="font-bold text-red-500">permanent</span>. All medical history, chat logs, and video records will be erased.
                  </p>
                  <div className="flex gap-3">
                      <Button onClick={() => setDeleteId(null)} variant="secondary" className="flex-1 bg-slate-800 text-white border-slate-700 hover:bg-slate-700">Cancel</Button>
                      <Button onClick={confirmDelete} variant="danger" className="flex-1">Yes, Delete</Button>
                  </div>
              </div>
          </div>
      )}

      {/* Enhanced Video Player Modal */}
      {playingVideo && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in">
              <div className="w-full max-w-5xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative flex flex-col">
                  {/* Header */}
                  <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                           <Video className="w-5 h-5 text-neon-blue" />
                           {playingVideo.session.difficulty} Session Recording
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5 font-mono">
                            {new Date(playingVideo.session.date).toLocaleString()} • {Math.floor(playingVideo.session.durationSeconds / 60)}m {playingVideo.session.durationSeconds % 60}s
                        </p>
                      </div>
                      <button 
                          onClick={closeVideo}
                          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-colors"
                      >
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Video Area */}
                  <div className="relative bg-black flex-1 flex items-center justify-center group">
                      <video 
                          ref={videoRef}
                          src={playingVideo.url} 
                          className="w-full h-full max-h-[60vh] object-contain"
                          onTimeUpdate={onTimeUpdate}
                          onClick={togglePlay}
                          autoPlay
                      />
                      
                      {/* Hover Overlay Controls */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 pointer-events-none">
                          <div className="pointer-events-auto">
                             {/* Progress Bar */}
                             <div className="w-full h-1 bg-slate-700 rounded-full mb-4 overflow-hidden cursor-pointer">
                                <div 
                                    className="h-full bg-neon-blue" 
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                />
                             </div>
                             
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                     <button onClick={togglePlay} className="text-white hover:text-neon-blue transition-colors">
                                         {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                                     </button>
                                     
                                     <div className="flex items-center gap-2">
                                        <button onClick={() => seek(-10)} className="p-2 hover:bg-white/10 rounded-full text-slate-300" title="-10s">
                                            <Rewind className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => seek(10)} className="p-2 hover:bg-white/10 rounded-full text-slate-300" title="+10s">
                                            <FastForward className="w-5 h-5" />
                                        </button>
                                     </div>

                                     <div className="flex items-center gap-1 border-l border-white/20 pl-4 ml-2">
                                         <span className="text-xs text-slate-400 uppercase font-bold mr-2">Frame</span>
                                         <button onClick={() => seek(-0.05)} className="p-1 hover:bg-white/10 rounded text-slate-300" title="Prev Frame">
                                             <ChevronLeft className="w-5 h-5" />
                                         </button>
                                         <button onClick={() => seek(0.05)} className="p-1 hover:bg-white/10 rounded text-slate-300" title="Next Frame">
                                             <ChevronRight className="w-5 h-5" />
                                         </button>
                                     </div>
                                 </div>

                                 <div className="flex items-center gap-4">
                                     <div className="text-sm font-mono text-slate-300">
                                         {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
                                     </div>
                                     
                                     <div className="flex bg-white/10 rounded-lg p-1 gap-1">
                                         {[0.5, 1, 1.5, 2].map(speed => (
                                             <button
                                                 key={speed}
                                                 onClick={() => changeSpeed(speed)}
                                                 className={`px-2 py-1 text-xs font-bold rounded ${playbackRate === speed ? 'bg-neon-blue text-slate-900' : 'text-slate-400 hover:text-white'}`}
                                             >
                                                 {speed}x
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative border border-slate-700">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white mb-2">Create Patient Profile</h2>
              <p className="text-slate-400 mb-8">Generate a unique access ID for a new patient.</p>
              
              <form onSubmit={handleCreatePatient} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Full Name</label>
                          <input 
                            required
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-neon-blue focus:outline-none text-white placeholder-slate-600"
                            placeholder="e.g. John Doe"
                            value={newPatientForm.name}
                            onChange={e => setNewPatientForm({...newPatientForm, name: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Age</label>
                          <input 
                              required
                              type="number"
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-neon-blue focus:outline-none text-white"
                              value={newPatientForm.age}
                              onChange={e => setNewPatientForm({...newPatientForm, age: e.target.value})}
                          />
                      </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resting HR</label>
                        <input type="number" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" value={newPatientForm.heartRate} onChange={e => setNewPatientForm({...newPatientForm, heartRate: Number(e.target.value)})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Systolic BP</label>
                        <input type="number" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" value={newPatientForm.systolicBP} onChange={e => setNewPatientForm({...newPatientForm, systolicBP: Number(e.target.value)})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Diastolic BP</label>
                        <input type="number" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500" value={newPatientForm.diastolicBP} onChange={e => setNewPatientForm({...newPatientForm, diastolicBP: Number(e.target.value)})} />
                     </div>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fitness Difficulty Plan</label>
                      <div className="grid grid-cols-3 gap-4">
                          {['Easy', 'Medium', 'Hard'].map((level) => (
                              <div 
                                key={level}
                                onClick={() => setNewPatientForm({...newPatientForm, fitnessLevel: level as FitnessLevel})}
                                className={`cursor-pointer text-center py-3 rounded-xl border transition-all font-medium ${newPatientForm.fitnessLevel === level ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                              >
                                  {level}
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  <div className="pt-4">
                      <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none shadow-lg shadow-blue-900/40" isLoading={isLoading}>
                          Generate ID & Create Profile
                      </Button>
                  </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
