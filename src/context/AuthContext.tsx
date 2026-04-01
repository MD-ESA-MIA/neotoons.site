import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
  isLoading: boolean;
  isProOrStudio: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const buildUser = (raw: any): User => ({
  id: raw.id,
  name: raw.name,
  displayName: raw.displayName || raw.name,
  username: raw.username,
  email: raw.email,
  role: raw.role || 'member',
  plan: raw.plan || 'free',
  credits: typeof raw.credits === 'number' ? raw.credits : 20,
  usage: typeof raw.usage === 'number' ? raw.usage : 0,
  joinedAt: raw.joinedAt || new Date().toISOString().split('T')[0],
  createdAt: raw.createdAt || new Date().toISOString(),
  lastActive: raw.lastActive || new Date().toISOString(),
  generationCount: typeof raw.generationCount === 'number' ? raw.generationCount : 0,
  avatar: raw.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(raw.name || raw.email || 'user')}`,
  followers: Array.isArray(raw.followers) ? raw.followers : [],
  following: Array.isArray(raw.following) ? raw.following : [],
  notificationSettings: raw.notificationSettings || { email: true, push: true, marketing: false },
  privacySettings: raw.privacySettings || { profilePublic: true, showActivity: true },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          setCurrentUser(null);
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          setCurrentUser(null);
          return;
        }

        const data = await response.json();
        setCurrentUser(buildUser(data));
      } catch (_error) {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      const payload = contentType?.includes('application/json') ? await response.json() : null;

      if (!response.ok || !payload?.user) {
        throw new Error(payload?.error || 'Invalid email or password');
      }

      setCurrentUser(buildUser(payload.user));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const username = `${name.toLowerCase().replace(/\s+/g, '_')}${Math.floor(Math.random() * 1000)}`;
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, username }),
      });

      const contentType = response.headers.get('content-type');
      const payload = contentType?.includes('application/json') ? await response.json() : null;

      if (!response.ok || !payload?.user) {
        throw new Error(payload?.error || 'Signup failed');
      }

      setCurrentUser(buildUser(payload.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setCurrentUser(null);
    }
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
  };

  const isProOrStudio = currentUser?.plan === 'pro' || currentUser?.plan === 'studio';

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, updateCurrentUser, isLoading, isProOrStudio }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
