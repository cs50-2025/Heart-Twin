import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, ShieldCheck, Activity, User, Lock, Mail } from 'lucide-react';
import { Button } from '../components/Button';
import { UserRole } from '../types';

export const Login = () => {
  const { login, registerDoctor } = useAuth();
  const [identifier, setIdentifier] = useState(''); // Acts as Name for Doctor, ID for Patient
  const [email, setEmail] = useState(''); // Only for registration
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'doctor' | 'patient'>('doctor');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    let success = false;

    if (activeTab === 'doctor') {
        if (isRegistering) {
            // Sign Up Logic
            if (!identifier || !password || !email) {
                setError('All fields are required.');
                setIsSubmitting(false);
                return;
            }
            success = await registerDoctor(identifier, email, password);
        } else {
            // Sign In Logic
            if (!identifier || !password) {
                setError('Name and Password are required.');
                setIsSubmitting(false);
                return;
            }
            // Name-based Login as requested
            success = await login(identifier, UserRole.DOCTOR, password);
        }
    } else {
        // Patient Login (ID only)
        const id = identifier || 'p1'; 
        success = await login(id, UserRole.PATIENT);
    }

    if (!success) {
      if (isRegistering) {
        setError('Registration failed. Email might already be in use.');
      } else {
        // Specific error message for doctors and patients
        const msg = activeTab === 'doctor' 
            ? 'Incorrect name or password please try again' 
            : 'Invalid Patient ID. Check with your doctor.';
        setError(msg);
      }
    }
    setIsSubmitting(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    // Clear sensitive fields
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-fade-in border border-slate-100 dark:border-slate-700">
        
        {/* Left Side - Brand */}
        <div className="md:w-1/2 bg-slate-950 p-12 text-white flex flex-col justify-between relative">
           <div className="relative z-10">
             <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-900/50">
               <HeartPulse className="w-7 h-7 text-white" />
             </div>
             <h1 className="text-4xl font-bold mb-4 tracking-tight">Heart Twin AI</h1>
             <p className="text-slate-400 text-lg leading-relaxed">
               The next generation of cardiovascular care. Real-time monitoring, AI-powered predictions, and personalized health insights.
             </p>
           </div>
           
           <div className="relative z-10 space-y-6 mt-12">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                 <ShieldCheck className="w-5 h-5 text-green-400" />
               </div>
               <div>
                 <p className="font-semibold">Secure & Private</p>
                 <p className="text-sm text-slate-500">HIPAA Compliant</p>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                 <Activity className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                 <p className="font-semibold">AI Fitness Coach</p>
                 <p className="text-sm text-slate-500">Real-time computer vision</p>
               </div>
             </div>
           </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center transition-all">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {activeTab === 'doctor' 
                  ? (isRegistering ? 'Create Account' : 'Doctor Portal') 
                  : 'Patient Portal'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
                {activeTab === 'doctor' 
                    ? (isRegistering ? 'Join the platform to manage patients.' : 'Sign in securely with your credentials.') 
                    : 'Enter the unique ID provided by your doctor.'}
            </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-8">
            <button 
              onClick={() => { setActiveTab('doctor'); setError(''); setIsRegistering(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'doctor' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              Doctor
            </button>
            <button 
              onClick={() => { setActiveTab('patient'); setError(''); setIsRegistering(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'patient' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              Patient
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {activeTab === 'doctor' ? 'Full Name' : 'Patient ID'}
              </label>
              <div className="relative">
                  {activeTab === 'doctor' ? (
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  ) : (
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  )}
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={activeTab === 'doctor' ? "Dr. Sarah Smith" : "e.g. P-1024"}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-white"
                  />
              </div>
            </div>

            {activeTab === 'doctor' && isRegistering && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@hospital.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-white"
                      />
                  </div>
                </div>
            )}

            {activeTab === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all dark:text-white"
                      />
                  </div>
                </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium text-sm rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-3.5 text-lg shadow-lg shadow-blue-500/20 mt-2" 
              isLoading={isSubmitting}
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </Button>
            
            {activeTab === 'doctor' && (
                <div className="text-center mt-4">
                    <button 
                        type="button"
                        onClick={toggleMode}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                        {isRegistering ? 'Already have an account? Sign In' : 'New here? Create an account'}
                    </button>
                </div>
            )}
          </form>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-slate-400 text-sm">
        &copy; 2024 Heart Twin AI. All rights reserved.
      </div>
    </div>
  );
};