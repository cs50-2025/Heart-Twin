import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StorageService } from '../services/storage';
import { WORKOUT_ROUTINES, Exercise } from '../services/fitnessData';
import { Button } from '../components/Button';
import { Play, CheckCircle2, VideoOff, Camera, StopCircle, RefreshCw, Activity, Heart, Info, Clock, Loader2 } from 'lucide-react';

export const Fitness = () => {
  const { patients, refreshPatients } = useApp();
  const me = patients[0];
  const [activeRoutine, setActiveRoutine] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [workoutStatus, setWorkoutStatus] = useState<'idle' | 'instruction' | 'active' | 'rest' | 'complete'>('idle');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Function to get a random set of 3 exercises from the pool
  const generateRandomRoutine = (fitnessLevel: string) => {
      const pool = WORKOUT_ROUTINES[fitnessLevel as keyof typeof WORKOUT_ROUTINES] || WORKOUT_ROUTINES['Easy'];
      // Shuffle array copy and take first 3
      return [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  useEffect(() => {
    if (me && workoutStatus === 'idle') {
        const routine = generateRandomRoutine(me.fitnessLevel || 'Easy');
        setActiveRoutine(routine);
    }
  }, [me, workoutStatus]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      handlePhaseComplete();
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const startWebcam = async () => {
    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsWebcamActive(true);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
             if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };
        mediaRecorder.start();
      }
    } catch (err) {
      console.error("Error accessing webcam", err);
      setWebcamError("Camera access denied. AI features disabled.");
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setIsWebcamActive(false);
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
      }
    }
  };

  const startWorkoutFlow = () => {
    setWorkoutStatus('instruction');
    setCurrentExerciseIndex(0);
  };

  const beginExercise = () => {
    setWorkoutStatus('active');
    setTimeLeft(activeRoutine[currentExerciseIndex].duration);
    setIsPlaying(true);
    startWebcam();
    recordedChunksRef.current = [];
  };

  const handlePhaseComplete = () => {
    if (workoutStatus === 'active') {
        if (currentExerciseIndex < activeRoutine.length - 1) {
            setWorkoutStatus('rest');
            setTimeLeft(20); 
        } else {
            finishWorkout();
        }
    } else if (workoutStatus === 'rest') {
        setWorkoutStatus('active');
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setTimeLeft(activeRoutine[nextIndex].duration);
    }
  };

  const finishWorkout = async () => {
    setIsPlaying(false);
    stopWebcam();
    setIsSaving(true);

    // Wait for recorder to stop
    await new Promise(resolve => setTimeout(resolve, 500));

    let videoBlob = undefined;
    if (recordedChunksRef.current.length > 0) {
        videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
    }

    await StorageService.saveWorkout(me.id, {
        id: `w-${Date.now()}`,
        patientId: me.id,
        date: new Date().toISOString(),
        durationSeconds: activeRoutine.reduce((acc, curr) => acc + curr.duration, 0),
        difficulty: me.fitnessLevel,
        exercisesCompleted: activeRoutine.map(e => e.name),
        videoUrl: '', // Will be handled by service
        aiFeedback: isWebcamActive 
            ? "Good endurance! Your pace was consistent. Remember to breathe rhythmically."
            : "Workout completed successfully (No video analysis)."
    }, videoBlob);
    
    setIsSaving(false);
    setWorkoutStatus('complete');
    refreshPatients();
  };

  if (!me) return <div>Loading...</div>;
  const currentExercise = activeRoutine[currentExerciseIndex];
  const nextExercise = activeRoutine[currentExerciseIndex + 1];

  // Circle Progress
  const totalTime = workoutStatus === 'active' ? currentExercise?.duration : 20;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circleRadius = 120;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-full flex flex-col gap-6">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Activity className="w-8 h-8 text-neon-blue" /> <span className="gradient-text">AI Fitness Coach</span>
           </h1>
           <p className="text-slate-400 mt-1">Difficulty: <span className="font-semibold text-neon-blue">{me.fitnessLevel}</span></p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-700">
           <Heart className="w-5 h-5 text-red-500 animate-pulse-fast" />
           <span className="font-mono font-bold text-white">{me.vitals.heartRate + (isPlaying ? 35 : 0)} BPM</span>
        </div>
      </header>

      {/* --- IDLE SCREEN --- */}
      {workoutStatus === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-3xl p-12 text-center border-t border-white/10 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none"></div>
             <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 neon-border relative z-10">
                 <Play className="w-10 h-10 text-neon-blue ml-1" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Start Your Session</h2>
             <p className="text-slate-400 max-w-md mb-8 relative z-10">
                 Today's session targets cardiovascular endurance and stability. The AI will analyze your movement in real-time.
             </p>
             <Button size="lg" onClick={startWorkoutFlow} className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-lg shadow-blue-900/40 hover:scale-105 transition-transform">
                 Initialize System
             </Button>
             
             <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl relative z-10">
                 {activeRoutine.map((ex, i) => (
                     <div key={ex.id} className="p-4 bg-slate-800/50 rounded-xl text-left border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                         <span className="text-xs font-bold text-slate-500 block mb-1">STEP 0{i+1}</span>
                         <p className="font-semibold text-white">{ex.name}</p>
                         <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> {ex.duration}s</p>
                     </div>
                 ))}
             </div>
        </div>
      )}

      {/* --- INSTRUCTION SCREEN --- */}
      {workoutStatus === 'instruction' && (
         <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-3xl p-12 text-center animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-slate-900 z-0">
                {/* Simulated abstract exercise visualization */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay"></div>
            </div>
            
            <div className="relative z-10 bg-slate-900/80 p-8 rounded-2xl border border-white/10 backdrop-blur-md max-w-lg w-full">
                <span className="text-neon-green text-xs font-bold uppercase tracking-widest mb-2 block">Next Up</span>
                <h2 className="text-4xl font-bold text-white mb-4">{activeRoutine[currentExerciseIndex].name}</h2>
                <div className="w-16 h-1 bg-neon-blue rounded-full mx-auto mb-6"></div>
                <p className="text-lg text-slate-300 mb-8">{activeRoutine[currentExerciseIndex].instruction}</p>
                <div className="flex items-center justify-center gap-2 mb-8 text-sm text-slate-400 bg-slate-800/50 py-2 px-4 rounded-full w-fit mx-auto">
                    <Info className="w-4 h-4 text-neon-blue" /> AI Analysis Enabled
                </div>
                <Button onClick={beginExercise} size="lg" className="w-full bg-neon-blue text-slate-900 hover:bg-cyan-400 font-bold">
                    Start Exercise
                </Button>
            </div>
         </div>
      )}

      {/* --- ACTIVE / REST SCREEN --- */}
      {(workoutStatus === 'active' || workoutStatus === 'rest') && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Visual Guide & Timer */}
            <div className={`rounded-3xl overflow-hidden relative flex flex-col items-center justify-center text-white p-8 transition-all duration-500 border border-white/10 ${workoutStatus === 'active' ? 'bg-slate-900' : 'bg-indigo-950'}`}>
                
                {/* SVG Progress Circle */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                    <svg width="400" height="400" className="transform -rotate-90">
                        <circle
                            cx="200"
                            cy="200"
                            r={circleRadius}
                            stroke="#334155"
                            strokeWidth="10"
                            fill="transparent"
                        />
                        <circle
                            cx="200"
                            cy="200"
                            r={circleRadius}
                            stroke={workoutStatus === 'active' ? '#00f3ff' : '#bc13fe'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                </div>

                <div className="relative z-10 text-center w-full">
                    {workoutStatus === 'active' ? (
                        <>
                            <div className="mb-4 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-neon-blue rounded-full inline-block text-xs font-bold uppercase tracking-wider">
                                Exercise {currentExerciseIndex + 1} / {activeRoutine.length}
                            </div>
                            <h2 className="text-5xl font-bold mb-6 tracking-tight text-white">{currentExercise.name}</h2>
                            <div className="text-9xl font-bold font-mono my-4 tabular-nums tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-lg">
                                {timeLeft}
                            </div>
                            <p className="text-xl text-slate-300 text-center max-w-md mx-auto">{currentExercise.instruction}</p>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-neon-purple rounded-full inline-block text-xs font-bold uppercase tracking-wider">
                                Recovery Phase
                            </div>
                            <h2 className="text-5xl font-bold mb-6 text-white">REST</h2>
                            <div className="text-9xl font-bold font-mono my-4 tabular-nums tracking-tighter text-white">{timeLeft}</div>
                            <div className="bg-white/5 p-6 rounded-2xl backdrop-blur-sm border border-white/10 max-w-sm mx-auto">
                                <p className="text-slate-400 text-xs uppercase font-bold mb-2">Coming Up Next</p>
                                <p className="text-2xl font-bold text-neon-purple">{nextExercise ? nextExercise.name : 'Cool Down'}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Webcam / AI View */}
            <div className="rounded-3xl overflow-hidden relative shadow-2xl bg-black border border-slate-800 flex flex-col">
                <div className="flex-1 relative bg-slate-950 flex items-center justify-center">
                    {!webcamError ? (
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover transform scale-x-[-1] opacity-90" 
                        />
                    ) : (
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <VideoOff className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-white font-medium mb-2">Camera Unavailable</p>
                        </div>
                    )}
                    
                    {/* Futuristic HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neon-blue rounded-tl-lg m-4"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neon-blue rounded-tr-lg m-4"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neon-blue rounded-bl-lg m-4"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neon-blue rounded-br-lg m-4"></div>
                        
                        {/* Grid Scan Lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
                    </div>
                </div>

                {!webcamError && (
                <>
                    <div className="absolute top-6 left-6 bg-red-500/20 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-red-500 text-xs border border-red-500/30 font-bold tracking-wider">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> LIVE
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="glass-panel rounded-xl p-4 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-neon-blue text-xs font-bold uppercase mb-1">AI Coach</h4>
                                <p className="text-white text-sm font-medium leading-relaxed">
                                {workoutStatus === 'active' 
                                    ? "Maintain your posture. Core engaged. Great rhythm!" 
                                    : "Take deep breaths. Recover and hydrate."}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
                )}
            </div>
            
            <div className="col-span-1 lg:col-span-2 flex justify-center pb-4">
                 <Button variant="danger" onClick={finishWorkout} className="w-full max-w-md shadow-lg shadow-red-500/20 bg-red-600/90 hover:bg-red-600 border border-red-500/50 backdrop-blur">
                    <StopCircle className="w-5 h-5 mr-2" /> End Session Early
                 </Button>
            </div>
        </div>
      )}

      {/* --- SAVING STATE --- */}
      {isSaving && (
          <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-3xl p-12 text-center animate-fade-in">
              <Loader2 className="w-12 h-12 text-neon-blue animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Saving Session Data...</h2>
              <p className="text-slate-400">Encrypting video and syncing with doctor's portal.</p>
          </div>
      )}

      {/* --- COMPLETE SCREEN --- */}
      {workoutStatus === 'complete' && !isSaving && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900/40 to-slate-900 rounded-3xl border border-emerald-500/20 p-12 text-center animate-fade-in relative overflow-hidden">
             <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 border border-emerald-500/30">
                 <CheckCircle2 className="w-12 h-12 text-emerald-400" />
             </div>
             <h2 className="text-4xl font-bold text-white mb-2">Session Complete</h2>
             <p className="text-emerald-200/70 mb-8 max-w-md">
                 Excellent work. Your biometrics and video have been securely transmitted to Dr. Smith.
             </p>
             
             <div className="glass-panel p-6 rounded-2xl w-full max-w-lg mb-8 text-left border-emerald-500/10">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400"/> Summary
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Total Duration</span>
                        <span className="font-mono font-medium text-white">{Math.floor(activeRoutine.reduce((a,b)=>a+b.duration,0)/60)}m 30s</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Exercises Completed</span>
                        <span className="font-mono font-medium text-white">{activeRoutine.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">Est. Calories</span>
                        <span className="font-mono font-medium text-orange-400">~145 kcal</span>
                    </div>
                </div>
             </div>

             <Button onClick={() => setWorkoutStatus('idle')} className="bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-lg shadow-emerald-900/50">
                 <RefreshCw className="w-4 h-4 mr-2" /> Start New Workout
             </Button>
        </div>
      )}
    </div>
  );
};