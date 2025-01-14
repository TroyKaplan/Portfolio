import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  role: 'user' | 'subscriber' | 'admin';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loading: true
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const heartbeat = setInterval(() => {
        axios.post('/api/auth/heartbeat').catch(console.error);
      }, 60000); // Send heartbeat every minute

      return () => clearInterval(heartbeat);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 