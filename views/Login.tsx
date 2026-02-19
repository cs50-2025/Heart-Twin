import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, ShieldCheck, Activity, User, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { UserRole } from '../types';

export const Login = () => {
  const { login, registerDoctor } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'doctor' | 'patient'>('doctor');
  const [isRegistering, setIsRegistering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    let success = false;
    if (activeTab === 'doctor') {
        if (isRegistering) {
            if (!identifier || !password || !email) {
                setError('All fields are required.');
                setIsSubmitting(false);
                return;
            }
            success = await registerDoctor(identifier, email, password);
        } else {
            if (!identifier || !password) {
                setError('Credentials required.');
                setIsSubmitting(false);
                return;
            }
            success = await login(identifier, UserRole.DOCTOR, password);
        }
    } else {
        const id = identifier || 'p1'; 
        success = await login(id, UserRole.PATIENT);
    }

    if (!success) {
      setError(isRegistering ? 'Registration failed.' : 'Access Denied. Verify credentials.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#050b14] flex items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" 
               style={{ transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)` }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" 
               style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }} />
          
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-5xl h-[650px] bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden group">
        
        {/* Glowing Borders */}
        <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

        {/* Left Side: Brand & Visuals */}
        <div className="md:w-1/2 relative p-12 flex flex-col justify-between overflow-hidden">
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/40 z-0"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <HeartPulse className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wider">HEART TWIN</span>
                </div>
                
                <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                    The Future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Cardiac AI</span>
                </h1>
                <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
                    Advanced biometrics, predictive modeling, and real-time patient twin simulation.
                </p>
            </div>

            {/* Feature Pills */}
            <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group/item">
                     <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover/item:text-blue-300 transition-colors">
                         <Activity className="w-5 h-5" />
                     </div>
                     <div>
                         <h3 className="text-white font-medium">Real-time Monitoring</h3>
                         <p className="text-xs text-slate-400">Continuous ECG & Vitals Stream</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group/item">
                     <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover/item:text-purple-300 transition-colors">
                         <Sparkles className="w-5 h-5" />
                     </div>
                     <div>
                         <h3 className="text-white font-medium">Gemini Pro Analysis</h3>
                         <p className="text-xs text-slate-400">Deep Learning Risk Prediction</p>
                     </div>
                 </div>
            </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 bg-slate-950/50 relative flex flex-col justify-center p-12">
            <div className="max-w-sm w-full mx-auto">
                {/* Role Switcher */}
                <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl mb-8 border border-white/5">
                    <button 
                        onClick={() => { setActiveTab('doctor'); setError(''); setIsRegistering(false); }}
                        className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'doctor' ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Medical Staff
                    </button>
                    <button 
                        onClick={() => { setActiveTab('patient'); setError(''); setIsRegistering(false); }}
                        className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'patient' ? 'bg-slate-800 text-white shadow-lg shadow-black/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Patient Portal
                    </button>
                </div>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {activeTab === 'doctor' ? (isRegistering ? 'Doctor Registration' : 'Welcome Back') : 'Patient Access'}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {activeTab === 'doctor' ? 'Enter credentials to access the dashboard.' : 'Enter your unique patient ID.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div className="group relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {activeTab === 'doctor' ? <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" /> : <ShieldCheck className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />}
                            </div>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                placeholder={activeTab === 'doctor' ? "Username" : "Patient ID (e.g. P-1234)"}
                            />
                        </div>

                        {activeTab === 'doctor' && (
                            <>
                                {isRegistering && (
                                    <div className="group relative animate-fade-in">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                            placeholder="Professional Email"
                                        />
                                    </div>
                                )}
                                <div className="group relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                                        placeholder="Password"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-fade-in">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        isLoading={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 border border-white/10 flex items-center justify-center gap-2 group"
                    >
                        {isRegistering ? 'Create Account' : 'Authenticate'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {activeTab === 'doctor' && (
                        <div className="text-center mt-4">
                            <button 
                                type="button"
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="text-xs text-slate-500 hover:text-white transition-colors"
                            >
                                {isRegistering ? 'Already have an ID? Login' : 'New staff? Register access'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Secured by End-to-End Encryption • HIPAA Compliant</p>
      </div>
    </div>
  );
};