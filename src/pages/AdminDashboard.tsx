import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { User, ActiveUser } from '../types/user';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { apiEndpoints } from '../config/api';
import { userService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatTimeSpent } from '../utils/timeFormatters';

interface VisitorStats {
  current: {
    total_anonymous: number;
    active_anonymous: number;
    total_page_views: number;
  };
  historical: Array<{
    date: string;
    anonymous_visitors: number;
    registered_visitors: number;
    total_page_views: number;
    peak_concurrent_users: number;
    average_session_duration: string;
  }>;
  aggregates: Array<{
    period: string;
    total_anonymous: number;
    total_registered: number;
    total_views: number;
    peak_users: number;
    avg_duration: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [anonymousCount, setAnonymousCount] = useState<number>(0);
  const [totalActive, setTotalActive] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [activeUserDetails, setActiveUserDetails] = useState<{
    authenticated: Array<{
      username: string;
      current_page: string;
      current_game?: string;
      last_seen: string;
    }>;
    anonymous: {
      totalCount: number;
      activeCount: number;
      currentPages: string[];
    };
    totalActive: number;
  }>({
    authenticated: [],
    anonymous: { totalCount: 0, activeCount: 0, currentPages: [] },
    totalActive: 0
  });

  const fetchActiveUsers = async () => {
    try {
      const response = await userService.getActiveUsers();
      setActiveUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching active users:', error);
    }
  };

  const fetchVisitorStats = async () => {
    try {
      const response = await axios.get(apiEndpoints.visitorStats);
      setVisitorStats(response.data);
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
      setVisitorStats(null);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/current-user', {
          withCredentials: true
        });
        if (response.data.user && response.data.user.role === 'admin') {
          setIsAuthenticated(true);
          fetchActiveUsers();
          fetchVisitorStats();
          const fetchUsers = async () => {
            try {
              const response = await axios.get('/api/users', {
                withCredentials: true,
                headers: { 'Accept': 'application/json' }
              });
              if (Array.isArray(response.data)) {
                setUsers(response.data);
              }
            } catch (err) {
              console.error('Error fetching users:', err);
              setUsers([]);
              if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Failed to fetch users');
              }
            }
          };
          fetchUsers();
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      const activeUsersInterval = setInterval(fetchActiveUsers, 30000);
      const visitorStatsInterval = setInterval(fetchVisitorStats, 30000);
      return () => {
        clearInterval(activeUsersInterval);
        clearInterval(visitorStatsInterval);
      };
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div className="admin-dashboard loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const updateRole = async (userId: string, role: 'user' | 'subscriber' | 'admin') => {
    try {
      const response = await axios.post('/api/update-role', 
        { userId, role },
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? { ...user, role: response.data.role } : user))
      );
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const viewUserDetails = (userId: string) => {
    navigate(`/admin/users/${userId}`);
  };

  return (
    <div className="admin-dashboard">
      <h2>Live Activity</h2>
      <div className="activity-summary">
        <div className="stat-card">
          <h3>Total Active Users</h3>
          <p className="stat-value">{activeUserDetails.totalActive}</p>
        </div>
        <div className="stat-card">
          <h3>Logged In Users</h3>
          <p className="stat-value">{activeUserDetails.authenticated.length}</p>
        </div>
        <div className="stat-card">
          <h3>Anonymous Users</h3>
          <p className="stat-value">{activeUserDetails.anonymous.activeCount}</p>
        </div>
      </div>

      <div className="active-users-list">
        <h3>Active Users Details</h3>
        {activeUserDetails.authenticated.map(user => (
          <div key={user.username} className="user-activity-card">
            <span className="username">{user.username}</span>
            <span className="location">
              {user.current_game ? `Playing ${user.current_game}` : `On ${user.current_page}`}
            </span>
            <span className="last-seen">
              Last active: {new Date(user.last_seen).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="anonymous-activity">
        <h3>Anonymous Activity</h3>
        <p>Current pages being viewed: {activeUserDetails.anonymous.currentPages.join(', ')}</p>
      </div>
    </div>
  );
};

const formatTime = (seconds: number): string => {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export default AdminDashboard; 