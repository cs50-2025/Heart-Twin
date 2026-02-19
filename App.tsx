import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { DoctorDashboard } from './views/DoctorDashboard';
import { PatientDashboard } from './views/PatientDashboard';
import { SimulationLab } from './views/SimulationLab';
import { Fitness } from './views/Fitness';
import { Chat } from './views/Chat';
import { Messages } from './views/Messages';
import { Settings } from './views/Settings';
import { Login } from './views/Login';
import { UserRole } from './types';

// Inner component to handle routing logic
const AppContent = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (isLoading) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return user.role === UserRole.DOCTOR ? <DoctorDashboard /> : <PatientDashboard />;
      case 'fitness':
        return <Fitness />;
      case 'chat':
        return <Chat />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      case 'simulation':
        return <SimulationLab />;
      default:
        return user.role === UserRole.DOCTOR ? <DoctorDashboard /> : <PatientDashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
