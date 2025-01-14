import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserProfileData } from '../types/interfaces';
import LoadingState from '../components/shared/LoadingState';
import ErrorMessage from '../components/shared/ErrorMessage';
import ProfileActions from '../components/ProfileActions';
import './UserProfile.css';
import { StripeStatus, statusMap } from '../types/subscription';
import SubscriptionService from '../services/subscriptionService';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : '';

const mapStripeStatus = (status: string): string => {
  return statusMap[status as StripeStatus] || status;
};

interface SubscriptionStatus {
  label: string;
  color: string;
}

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log('Fetching profile data...');
        const userResponse = await axios.get(`${API_URL}/api/auth/current-user`);
        console.log('User Response:', userResponse.data);

        const userData = userResponse.data.user;
        
        setUserProfile({
          username: userData.username,
          email: userData.email,
          role: userData.role,
          created_at: userData.created_at,
          subscription_status: userData.subscription_status,
          subscription_end_date: userData.subscription_end_date,
          subscription_start_date: userData.subscription_start_date,
          total_time_spent: userData.total_time_spent
        });
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const getSubscriptionStatus = (status: string): SubscriptionStatus => {
    console.log('[UserProfile] Getting status for:', status);
    
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

    const result = statusMap[status] || { label: status || 'Unknown', color: 'gray' };
    console.log('[UserProfile] Mapped status:', { input: status, output: result });
    return result;
  };

  if (isLoading) {
    console.log('Component in loading state');
    return <LoadingState />;
  }

  if (error) {
    console.log('Component in error state:', error);
    return <ErrorMessage error={{ message: error }} onClose={() => setError(null)} />;
  }

  if (!userProfile) {
    console.log('No user profile data available');
    return null;
  }

  const subscriptionStatus = getSubscriptionStatus(userProfile.subscription_status);
  console.log('[UserProfile] Final subscription status:', subscriptionStatus);

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      <div className="profile-section">
        <h3>Basic Information</h3>
        <p>Username: {userProfile.username}</p>
        <p>Email: {userProfile.email}</p>
        <p>Role: <span className={`role-badge ${userProfile.role.toLowerCase()}`}>{userProfile.role}</span></p>
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
            <div className="stat-value">{userProfile.total_time_spent || 0}</div>
            <div className="stat-label">Total Seconds</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add some basic styles
const styles = `
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.profile-section h3 {
  margin-top: 0;
  color: #333;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default UserProfile; 