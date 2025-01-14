import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserDetails.css';

interface GameStat {
  game_name: string;
  playtime: number;
  last_played: string;
  save_data: any;
}

interface Achievement {
  game_name: string;
  achievement_name: string;
  unlocked_at: string;
}

interface UserDetail {
  username: string;
  role: string;
  created_at: string;
  last_login: string;
  total_time_spent: number;
  device_info?: {
    type: string;
    os: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
  };
  games: GameStat[];
  achievements: Achievement[];
}

const UserDetails: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetail | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setUserDetails(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (!userDetails) return <div>Loading...</div>;

  const games = userDetails.games || [];
  const achievements = userDetails.achievements || [];

  return (
    <div className="user-details-page">
      <div className="header-section">
        <button className="back-button" onClick={() => navigate('/admin')}>
          &larr; Back to Dashboard
        </button>
        <h1>User Details: {userDetails.username}</h1>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h2>Account Information</h2>
          <div className="stat-item">
            <span>Role:</span>
            <span className={`role-badge ${userDetails.role}`}>{userDetails.role}</span>
          </div>
          <div className="stat-item">
            <span>Created:</span>
            <span>{new Date(userDetails.created_at).toLocaleDateString()}</span>
          </div>
          <div className="stat-item">
            <span>Last Login:</span>
            <span>{userDetails.last_login ? new Date(userDetails.last_login).toLocaleString() : 'Never'}</span>
          </div>
          <div className="stat-item">
            <span>Total Time:</span>
            <span>{Math.floor(userDetails.total_time_spent / 3600)}h {Math.floor((userDetails.total_time_spent % 3600) / 60)}m</span>
          </div>
        </div>

        <div className="stats-card">
          <h2>Device Information</h2>
          <div className="stat-item">
            <span>Type:</span>
            <span>{userDetails.device_info?.type || 'Unknown'}</span>
          </div>
          <div className="stat-item">
            <span>OS:</span>
            <span>{userDetails.device_info?.os || 'Unknown'}</span>
          </div>
          <div className="stat-item">
            <span>Browser:</span>
            <span>{userDetails.device_info?.browser || 'Unknown'}</span>
          </div>
          <div className="stat-item">
            <span>Screen:</span>
            <span>{userDetails.device_info?.screenWidth || 0}x{userDetails.device_info?.screenHeight || 0}</span>
          </div>
        </div>

        <div className="stats-card games-card">
          <h2>Game Statistics</h2>
          {games.length === 0 ? (
            <p className="no-data">No game statistics available</p>
          ) : (
            <div className="games-list">
              {games.map((game: GameStat) => (
                <div key={game.game_name} className="game-stat-item">
                  <h3>{game.game_name}</h3>
                  <div className="stat-item">
                    <span>Playtime:</span>
                    <span>{Math.floor(game.playtime / 3600)}h {Math.floor((game.playtime % 3600) / 60)}m</span>
                  </div>
                  <div className="stat-item">
                    <span>Last Played:</span>
                    <span>{new Date(game.last_played).toLocaleString()}</span>
                  </div>
                  <details className="save-data">
                    <summary>Save Data</summary>
                    <pre>{JSON.stringify(game.save_data, null, 2)}</pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="stats-card achievements-card">
          <h2>Achievements</h2>
          {achievements.length === 0 ? (
            <p className="no-data">No achievements unlocked</p>
          ) : (
            <div className="achievements-list">
              {achievements.map((achievement: Achievement) => (
                <div key={`${achievement.game_name}-${achievement.achievement_name}`} className="achievement-item">
                  <div className="achievement-name">{achievement.achievement_name}</div>
                  <div className="achievement-game">{achievement.game_name}</div>
                  <div className="achievement-date">
                    {new Date(achievement.unlocked_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails; 