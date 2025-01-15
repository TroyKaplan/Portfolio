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
  summary: {
    averageTotal: number;
    averageAuthenticated: number;
    averageAnonymous: number;
    peakConcurrent: number;
  };
  dailyStats: Array<{
    date: string;
    total_users: number;
    authenticated_users: number;
    anonymous_users: number;
    peak_concurrent: number;
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
      last_seen: string;
      role: string;
      email: string;
    }>;
    anonymous: {
      count: number;
      currentPages: string[];
    };
    totalActive: number;
  }>({
    authenticated: [],
    anonymous: { count: 0, currentPages: [] },
    totalActive: 0
  });

  const fetchActiveUsers = async () => {
    try {
      console.log('Fetching active users...');
      const response = await userService.getActiveUsers();
      console.log('Active users response:', response.data);
      setActiveUserDetails(response.data);
      setActiveUsers(response.data.authenticated);
      setActiveCount(response.data.authenticated.length);
      setAnonymousCount(response.data.anonymous.count);
      setTotalActive(response.data.totalActive);
    } catch (error) {
      const err = error as any;
      console.error('Error fetching active users:', {
        message: err?.response?.data?.message || err?.message || 'Unknown error',
        status: err?.response?.status || 500,
        details: err?.response?.data || err
      });
      setError('Failed to fetch active users');
      setActiveUserDetails({
        authenticated: [],
        anonymous: { count: 0, currentPages: [] },
        totalActive: 0
      });
    }
  };

  const fetchVisitorStats = async () => {
    try {
      const response = await userService.getVisitorStats();
      setVisitorStats(response.data);
    } catch (error) {
      const err = error as any;
      console.error('Error fetching visitor stats:', {
        message: err?.response?.data?.message || err?.message || 'Unknown error',
        status: err?.response?.status || 500,
        details: err?.response?.data || err
      });
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
      <h1>User Management</h1>
      
      <div className="active-users-summary">
        <h2>Live Activity</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{activeUserDetails.totalActive}</div>
            <div className="stat-label">Total Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeUserDetails.authenticated.length}</div>
            <div className="stat-label">Active Registered Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeUserDetails.anonymous.count}</div>
            <div className="stat-label">Anonymous Users</div>
          </div>
        </div>

        <div className="active-users-list">
          <h3>Active Users</h3>
          {activeUserDetails.authenticated.map(user => (
            <div key={user.username} className="active-user-item">
              <div className="user-info">
                <span className="username">{user.username}</span>
                <span className="role">{user.role}</span>
              </div>
              <div className="activity-info">
                <span className="current-page">
                  {user.current_page || 'Browsing'}
                </span>
                <span className="last-seen">
                  Last seen: {new Date(user.last_seen).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {visitorStats && (
        <div className="visitor-stats">
          <h3>30-Day Statistics</h3>
          <div className="summary">
            <div>
              <h4>Average Daily Users</h4>
              <p>Total: {visitorStats.summary.averageTotal}</p>
              <p>Authenticated: {visitorStats.summary.averageAuthenticated}</p>
              <p>Anonymous: {visitorStats.summary.averageAnonymous}</p>
            </div>
            <div>
              <h4>Peak Concurrent Users</h4>
              <p>{visitorStats.summary.peakConcurrent}</p>
            </div>
          </div>
          <div className="historical-data">
            <h4>Daily Breakdown</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Average Users</th>
                  <th>Peak Users</th>
                </tr>
              </thead>
              <tbody>
                {visitorStats.dailyStats.map(day => (
                  <tr key={day.date}>
                    <td>{new Date(day.date).toLocaleDateString()}</td>
                    <td>{day.total_users}</td>
                    <td>{day.peak_concurrent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Last Login</th>
            <th>Total Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>
                <select
                  value={user.role}
                  onChange={e => updateRole(user.id, e.target.value as 'user' | 'subscriber' | 'admin')}
                >
                  <option value="user">User</option>
                  <option value="subscriber">Subscriber</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</td>
              <td>{formatTime(user.total_time_spent)}</td>
              <td>
                <button onClick={() => viewUserDetails(user.id)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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