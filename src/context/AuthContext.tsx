import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../features/auth/api';
import axios from 'axios';
import { userService } from '../services/api';

interface User {
  id: string;
  username: string;
  role: 'user' | 'subscriber' | 'admin';
  created_at: string;
  subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled';
  subscription_end_date?: string;
  subscription_start_date?: string;
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
      const logContext = {
        timestamp: new Date().toISOString(),
        component: 'AuthProvider',
        action: 'initAuth'
      };

      console.log('Auth initialization started', logContext);

      try {
        const data = await getCurrentUser();
        console.log('Auth initialization successful', {
          ...logContext,
          user: {
            id: data.user?.id,
            username: data.user?.username,
            role: data.user?.role
          }
        });
        setUser(data.user);
      } catch (error) {
        const errorDetails = {
          ...logContext,
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          message: error instanceof Error ? error.message : 'Unknown error'
        };

        if (axios.isAxiosError(error)) {
          console.error('Auth initialization failed', {
            ...errorDetails,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          });
        } else {
          console.error('Auth initialization failed', errorDetails);
        }
      } finally {
        console.log('Auth initialization completed', logContext);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const sendHeartbeat = () => {
      const currentPage = window.location.pathname;
      
      if (user) {
        userService.sendHeartbeat({ currentPage })
          .catch(error => {
            console.error('Heartbeat failed:', error.response?.data || error.message);
          });
      } else {
        // Send anonymous heartbeat if no user is logged in
        userService.sendAnonymousHeartbeat({ currentPage })
          .catch(error => {
            console.error('Anonymous heartbeat failed:', error.response?.data || error.message);
          });
      }
    };

    // Send initial heartbeat
    sendHeartbeat();
    
    // Set up interval
    const heartbeatInterval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 