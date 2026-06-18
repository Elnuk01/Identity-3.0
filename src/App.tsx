import React, { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import SuccessPage from './components/SuccessPage';
import { Registration } from './types';

export default function App() {
  const [darkMode] = useState<boolean>(false); // Premium clean default
  const [registeredData, setRegisteredData] = useState<Registration | null>(null);

  const handleRegisterSuccess = (registration: Registration) => {
    setRegisteredData(registration);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetRegistration = () => {
    setRegisteredData(null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ${
        darkMode ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-zinc-900'
      }`}
    >
      <main className="flex-grow flex items-center justify-center py-8">
        {registeredData ? (
          <SuccessPage
            registration={registeredData}
            darkMode={darkMode}
            onReset={handleResetRegistration}
          />
        ) : (
          <RegistrationForm
            darkMode={darkMode}
            onSuccess={handleRegisterSuccess}
          />
        )}
      </main>
    </div>
  );
}
