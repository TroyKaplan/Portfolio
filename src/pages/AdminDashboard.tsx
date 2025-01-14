import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { User, ActiveUser } from '../types/user';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { apiEndpoints } from '../config/api';

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

  const fetchActiveUsers = async () => {
    try {
      const response = await axios.get('/api/active-users', {
        withCredentials: true
      });
      
      setActiveUsers(response.data.authenticated);
      setAnonymousCount(response.data.anonymous.length);
      setTotalActive(response.data.totalActive);
    } catch (error) {
      console.error('Error fetching active users:', error);
      setActiveUsers([]);
      setAnonymousCount(0);
      setTotalActive(0);
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
      <h1>User Management</h1>
      
      <div className="active-users-summary">
        <h2>Active Users: {activeCount}</h2>
        <div className="active-users-list">
          {activeUsers.map(user => (
            <div key={user.username} className="active-user-item">
              {user.username} - Last seen: {new Date(user.last_seen).toLocaleTimeString()}
            </div>
          ))}
        </div>
      </div>

      <div className="visitor-stats">
        <h2>Visitor Statistics</h2>
        
        {/* Current Stats */}
        <div className="current-stats">
          <h3>Current Activity</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{visitorStats?.current?.active_anonymous || 0}</div>
              <div className="stat-label">Active Anonymous Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{visitorStats?.current?.total_anonymous || 0}</div>
              <div className="stat-label">Total Anonymous Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">Active Registered Users</div>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="aggregate-stats">
          <h3>Summary</h3>
          {visitorStats?.aggregates?.map(stat => (
            <div key={stat.period} className="period-stats">
              <h4>{stat.period.charAt(0).toUpperCase() + stat.period.slice(1)}</h4>
              <p>Anonymous Users: {stat.total_anonymous}</p>
              <p>Registered Users: {stat.total_registered}</p>
              <p>Peak Concurrent: {stat.peak_users}</p>
              <p>Avg Session: {Math.round(stat.avg_duration / 60)} minutes</p>
            </div>
          )) || <p>No aggregate data available</p>}
        </div>

        {/* Historical Data */}
        <div className="historical-stats">
          <h3>Historical Data</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Anonymous</th>
                <th>Registered</th>
                <th>Peak Users</th>
                <th>Avg Session</th>
              </tr>
            </thead>
            <tbody>
              {visitorStats?.historical?.map(day => (
                <tr key={day.date}>
                  <td>{new Date(day.date).toLocaleDateString()}</td>
                  <td>{day.anonymous_visitors}</td>
                  <td>{day.registered_visitors}</td>
                  <td>{day.peak_concurrent_users}</td>
                  <td>{formatTime(parseInt(day.average_session_duration))}</td>
                </tr>
              )) || <tr><td colSpan={5}>No historical data available</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

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