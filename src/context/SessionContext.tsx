import React, { createContext, useContext, useState } from 'react';

interface SessionContextType {
  generationCount: number;
  incrementCount: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [generationCount, setGenerationCount] = useState(0);

  const incrementCount = () => {
    setGenerationCount(prev => prev + 1);
  };

  return (
    <SessionContext.Provider value={{ generationCount, incrementCount }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
