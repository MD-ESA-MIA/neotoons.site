import React, { createContext, useContext, useState, useEffect } from 'react';
import { LibraryItem, AppMode } from '../types';
import { useAuth } from './AuthContext';

interface LibraryContextType {
  library: LibraryItem[];
  saveItem: (type: AppMode, title: string, content: string) => void;
  deleteItem: (id: string) => void;
  isLoading: boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      const savedLibrary = localStorage.getItem(`neotoons_lib_${currentUser.id}`);
      if (savedLibrary) {
        setLibrary(JSON.parse(savedLibrary));
      } else {
        setLibrary([]);
      }
    } else {
      setLibrary([]);
    }
    setIsLoading(false);
  }, [currentUser]);

  const saveItem = (type: AppMode, title: string, content: string) => {
    if (!currentUser) return;
    
    const newItem: LibraryItem = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      type,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    
    const updatedLibrary = [newItem, ...library];
    setLibrary(updatedLibrary);
    localStorage.setItem(`neotoons_lib_${currentUser.id}`, JSON.stringify(updatedLibrary));
  };

  const deleteItem = (id: string) => {
    if (!currentUser) return;
    const updatedLibrary = library.filter(item => item.id !== id);
    setLibrary(updatedLibrary);
    localStorage.setItem(`neotoons_lib_${currentUser.id}`, JSON.stringify(updatedLibrary));
  };

  return (
    <LibraryContext.Provider value={{ library, saveItem, deleteItem, isLoading }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
