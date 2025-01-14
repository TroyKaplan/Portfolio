import React, { useState, useEffect } from 'react';
import './UserProfile.css';

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

  if (isLoading) {
    console.log('Rendering loading state');
    return <LoadingState />;
  }
  if (error) {
    console.log('Rendering error state:', error);
    return <ErrorMessage error={{ message: error }} onClose={() => setError(null)} />;
  }
  if (!userProfile) {
    console.log('No user profile data available');
    return null;
  }

  console.log('Rendering user profile:', userProfile);

  const subscriptionStatus = getSubscriptionStatus(userProfile.subscription_status);

  return (
    <div className="profile-container">
      <div className="profile-section">
        <h3>Basic Information</h3>
        <p>Username: {userProfile.username}</p>
        <p>Email: {userProfile.email}</p>
        <p>Role: <span className={`role-badge ${userProfile.role.toLowerCase()}`}>{userProfile.role}</span></p>
        <div className="profile-actions">
          <button className="profile-button" onClick={handleUpdateEmail}>
            Update Email
          </button>
          <button className="profile-button" onClick={handleChangePassword}>
            Change Password
          </button>
        </div>
      </div>

      <div className="profile-section">
        <h3>Subscription Details</h3>
        <p>Status: 
          <span className={`status-badge ${subscriptionStatus.label.toLowerCase()}`}>
            {subscriptionStatus.label}
          </span>
        </p>
        {userProfile.subscription_start_date && (
          <p>Start Date: {new Date(userProfile.subscription_start_date).toLocaleDateString()}</p>
        )}
        {userProfile.subscription_end_date && (
          <p>End Date: {new Date(userProfile.subscription_end_date).toLocaleDateString()}</p>
        )}
      </div>

      <div className="profile-section">
        <h3>Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">
              {formatTimeSpent(userProfile.total_time_spent || 0)}
            </div>
            <div className="stat-label">Total Time</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 