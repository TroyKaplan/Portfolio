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

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [authResponse, subscriptionStatus] = await Promise.all([
          axios.get(`${API_URL}/api/auth/current-user`),
          SubscriptionService.getCurrentStatus()
        ]);

        setUserProfile({
          ...authResponse.data.user,
          subscription_status: subscriptionStatus.status,
          subscription_end_date: subscriptionStatus.endDate,
          subscription_start_date: subscriptionStatus.startDate,
          role: subscriptionStatus.role
        });
      } catch (err) {
        console.error('=== Auth/Profile Error Details ===');
        console.error('Error Type:', err instanceof Error ? err.constructor.name : typeof err);
        console.error('Error Message:', err instanceof Error ? err.message : 'Unknown error');
        
        if (axios.isAxiosError(err)) {
          console.error('Axios Error Config:', {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers,
            withCredentials: err.config?.withCredentials
          });
          console.error('Axios Error Response:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            headers: err.response?.headers,
            data: err.response?.data
          });
        }

        if (axios.isAxiosError(err) && err.response?.status === 401) {
          console.warn('Session expired, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

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

  console.log('Rendering profile with data:', {
    basicInfo: {
      username: userProfile.username,
      email: userProfile.email,
      role: userProfile.role,
      created: userProfile.created_at
    },
    subscription: {
      status: userProfile.subscription_status,
      endDate: userProfile.subscription_end_date,
      startDate: userProfile.subscription_start_date
    },
    stats: {
      totalPlaytime: userProfile.total_playtime,
      achievements: userProfile.achievements?.length || 0
    }
  });

  const statusMap: Record<StripeStatus, string> = {
    'incomplete': 'pending',
    'incomplete_expired': 'inactive',
    'trialing': 'active',
    'active': 'active',
    'past_due': 'pending',
    'canceled': 'canceled',
    'unpaid': 'inactive'
  };

  const statusInfo = statusMap[(userProfile.subscription_status || 'inactive') as StripeStatus] || 
    { label: userProfile.subscription_status || 'Unknown', color: 'gray' };
  
  return (
    <div className="user-profile-page">
      <div className="header-section">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>User Profile</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-card basic-info">
          <h2>Basic Information</h2>
          <div className="stat-item">
            <span>Username</span>
            <span>{userProfile.username}</span>
          </div>
          <div className="stat-item">
            <span>Email</span>
            <span>{userProfile.email || 'Not provided'}</span>
          </div>
          <div className="stat-item">
            <span>Role</span>
            <span className={`role-badge ${userProfile.role}`}>
              {userProfile.role}
            </span>
          </div>
          <div className="stat-item">
            <span>Member Since</span>
            <span>{new Date(userProfile.created_at).toLocaleDateString()}</span>
          </div>
          <div className="stat-item">
            <span>Last Login</span>
            <span>{userProfile.last_login ? 
              new Date(userProfile.last_login).toLocaleString() : 
              'Never'}</span>
          </div>
          <div className="stat-item">
            <span>Total Time Spent</span>
            <span>{userProfile.total_time_spent ? 
              `${Math.floor(userProfile.total_time_spent / 3600)}h ${Math.floor((userProfile.total_time_spent % 3600) / 60)}m` : 
              '0h 0m'}</span>
          </div>
        </div>

        <div className="profile-card account-actions">
          <h2>Account Actions</h2>
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

        <div className="profile-card subscription-info">
          <h2>Subscription Status</h2>
          <div className="stat-item">
            <span>Status</span>
            <span className={`status-badge ${userProfile.subscription_status}`}>
              {userProfile.subscription_status === 'active' ? 'Active' :
               userProfile.subscription_status === 'canceling' ? 'Canceling' :
               'Inactive'}
            </span>
          </div>
          <div className="stat-item">
            <span>Start Date</span>
            <span>
              {userProfile.subscription_start_date ? 
                new Date(userProfile.subscription_start_date).toLocaleDateString() : 
                'N/A'}
            </span>
          </div>
          <div className="stat-item">
            <span>End Date</span>
            <span>
              {userProfile.subscription_end_date ? 
                new Date(Number(userProfile.subscription_end_date) * 1000).toLocaleDateString() : 
                'N/A'}
            </span>
          </div>
        </div>

        <div className="profile-card gaming-stats">
          <h2>Gaming Statistics</h2>
          <div className="stat-item">
            <span>Total Playtime</span>
            <span>{Math.floor((userProfile.total_playtime || 0) / 3600)}h {Math.floor(((userProfile.total_playtime || 0) % 3600) / 60)}m</span>
          </div>
          <div className="stat-item">
            <span>Achievements</span>
            <span>{userProfile.achievements?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 