import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import './AdminDashboard.css';

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
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [anonymousCount, setAnonymousCount] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [error, setError] = useState<string>('');

  const fetchActiveUsers = async () => {
    try {
      console.log('Fetching active users...');
      const response = await userService.getActiveUsers();
      console.log('Active users response:', response.data);
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
      setActiveUsers([]);
      setActiveCount(0);
      setAnonymousCount(0);
      setTotalActive(0);
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
      setError('Failed to fetch visitor statistics');
    }
  };

  useEffect(() => {
    fetchActiveUsers();
    fetchVisitorStats();
    const interval = setInterval(() => {
      fetchActiveUsers();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Live Activity Section */}
      <div className="live-activity-section">
        <h2>Live Activity</h2>
        <div className="activity-stats">
          <div className="stat-item">
            <h3>Active Users: {activeCount}</h3>
            <h3>Anonymous Users: {anonymousCount}</h3>
            <h3>Total Active: {totalActive}</h3>
          </div>
        </div>
        <div className="active-users-list">
          {activeUsers.map((user: any) => (
            <div key={user.user_id} className="user-item">
              <span>{user.username}</span>
              <span>{user.current_page}</span>
              <span>Last seen: {new Date(user.last_seen).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visitor Statistics Section */}
      {visitorStats && (
        <div className="visitor-stats">
          <h2 className="stats-header">30-Day Visitor Statistics</h2>
          
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-value">{visitorStats.summary.averageTotal}</div>
              <div className="stat-label">Average Daily Users</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{visitorStats.summary.averageAuthenticated}</div>
              <div className="stat-label">Average Registered Users</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{visitorStats.summary.averageAnonymous}</div>
              <div className="stat-label">Average Anonymous Users</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-value">{visitorStats.summary.peakConcurrent}</div>
              <div className="stat-label">Peak Concurrent Users</div>
            </div>
          </div>

          <div className="historical-data">
            <h3>Daily Breakdown</h3>
            <table className="historical-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Users</th>
                  <th>Registered</th>
                  <th>Anonymous</th>
                  <th>Peak Users</th>
                </tr>
              </thead>
              <tbody>
                {visitorStats.dailyStats.map(day => (
                  <tr key={day.date}>
                    <td>{new Date(day.date).toLocaleDateString()}</td>
                    <td>{day.total_users}</td>
                    <td>{day.authenticated_users}</td>
                    <td>{day.anonymous_users}</td>
                    <td>{day.peak_concurrent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AdminDashboard; 