import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';
import ProfileActions from '../components/ProfileActions';
import { formatTimeSpent, formatDetailedTime } from '../utils/timeFormatters';

interface UserProfile {
  username: string;
  email: string;
  role: string;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  total_time_spent: number;
}

interface SubscriptionStatus {
  label: string;
  color: string;
}

const getSubscriptionStatus = (status: string): SubscriptionStatus => {
  const statusMap: Record<string, SubscriptionStatus> = {
    'incomplete': { label: 'Pending', color: 'orange' },
    'incomplete_expired': { label: 'Inactive', color: 'red' },
    'trialing': { label: 'Active', color: 'green' },
    'active': { label: 'Active', color: 'green' },
    'past_due': { label: 'Past Due', color: 'red' },
    'canceled': { label: 'Canceled', color: 'gray' },
    'unpaid': { label: 'Unpaid', color: 'red' },
    'pending': { label: 'Pending', color: 'orange' }
  };

  return statusMap[status] || { label: status || 'Unknown', color: 'gray' };
};

const LoadingState: React.FC = () => (
  <div className="loading-state">Loading...</div>
);

const ErrorMessage: React.FC<{ 
  error: { message: string }; 
  onClose: () => void;
}> = ({ error, onClose }) => (
  <div className="error-message">
    <p>{error.message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    console.log('UserProfile component mounted');
    console.log('Initial state:', { userProfile, isLoading, error });
    
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      console.log('Fetching profile data...');
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Profile fetch failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error('Failed to fetch profile data');
      }
      
      const data = await response.json();
      console.log('Profile data received:', data);
      setUserProfile(data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeSpent = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.length > 0 ? parts.join(' ') : '0m';
  };

  const handleUpdateEmail = () => {
    // Implement email update logic
    console.log('Update email clicked');
  };

  const handleChangePassword = () => {
    // Implement password change logic
    console.log('Change password clicked');
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorMessage error={{ message: error }} onClose={() => setError(null)} />;
  if (!userProfile) return null;

  const subscriptionStatus = getSubscriptionStatus(userProfile.subscription_status);
  const hours = Math.floor(userProfile.total_time_spent / 3600);
  const minutes = Math.floor((userProfile.total_time_spent % 3600) / 60);

  return (
    <div className="profile-container">
      <div className="header-section">
        <h1>User Profile</h1>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h2>Account Information</h2>
          <div className="stat-item">
            <span>Username:</span>
            <span>{userProfile.username}</span>
          </div>
          <div className="stat-item">
            <span>Email:</span>
            <span>{userProfile.email}</span>
          </div>
          <div className="stat-item">
            <span>Role:</span>
            <span className={`role-badge ${userProfile.role}`}>{userProfile.role}</span>
          </div>
          <div className="account-actions">
            <ProfileActions 
              email={userProfile.email} 
              onEmailUpdate={(newEmail) => {
                setUserProfile({
                  ...userProfile,
                  email: newEmail
                });
              }}
            />
          </div>
        </div>

        <div className="stats-card">
          <h2>Subscription Details</h2>
          <div className="stat-item">
            <span>Status:</span>
            <span className={`status-badge ${subscriptionStatus.color}`}>
              {subscriptionStatus.label}
            </span>
          </div>
          {userProfile.subscription_start_date && (
            <div className="stat-item">
              <span>Start Date:</span>
              <span>{new Date(userProfile.subscription_start_date).toLocaleDateString()}</span>
            </div>
          )}
          {userProfile.subscription_end_date && (
            <div className="stat-item">
              <span>Next Payment Date/End Date:</span>
              <span>{new Date(userProfile.subscription_end_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="stats-card">
          <h2>Usage Statistics</h2>
          <div className="stat-item">
            <span>Total Time:</span>
            <span>{hours}h {minutes}m</span>
          </div>
        </div>
      </div>

      {success && (
        <div className="success-message">
          {success}
          <button onClick={() => setSuccess(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 