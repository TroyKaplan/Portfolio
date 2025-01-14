import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserProfileData } from '../types/interfaces';
import LoadingState from '../components/shared/LoadingState';
import ErrorMessage from '../components/shared/ErrorMessage';
import ProfileActions from '../components/ProfileActions';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      try {
        console.log('Starting profile fetch process...');
        const authResponse = await axios.get('/api/auth/current-user', {
          withCredentials: true
        });
        console.log('Auth check response:', {
          status: authResponse.status,
          data: authResponse.data
        });

        if (!authResponse.data.user) {
          console.warn('No user found in auth response, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Fetching detailed profile data...');
        const profileResponse = await axios.get('/api/user/profile', {
          withCredentials: true,
          headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          transformResponse: [(data) => {
            try {
              return JSON.parse(data);
            } catch (error) {
              console.error('Error parsing response:', data);
              return null;
            }
          }]
        });

        if (!profileResponse.data || typeof profileResponse.data === 'string') {
          console.error('Invalid profile data received:', profileResponse.data);
          setError('Invalid profile data received from server');
          return;
        }

        console.log('Profile data received:', {
          status: profileResponse.status,
          data: profileResponse.data,
          subscription: {
            status: profileResponse.data.subscription_status,
            endDate: profileResponse.data.subscription_end_date,
            startDate: profileResponse.data.subscription_start_date
          },
          basicInfo: {
            username: profileResponse.data.username,
            email: profileResponse.data.email,
            role: profileResponse.data.role,
            created: profileResponse.data.created_at
          }
        });

        setUserProfile(profileResponse.data);
      } catch (err) {
        console.error('Profile fetch error:', {
          error: err,
          type: err instanceof Error ? err.constructor.name : typeof err,
          message: err instanceof Error ? err.message : 'Unknown error'
        });

        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data
          });
          setError(err.response?.data?.message || 'Failed to load profile data');
        } else {
          setError('An unexpected error occurred');
        }
        
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          console.warn('Unauthorized access, redirecting to login');
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchProfile();
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

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'green' },
    pending: { label: 'Payment Pending', color: 'orange' },
    inactive: { label: 'Inactive', color: 'red' },
    canceled: { label: 'Canceled', color: 'gray' }
  };

  const statusInfo = statusMap[userProfile.subscription_status || 'inactive'] || 
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