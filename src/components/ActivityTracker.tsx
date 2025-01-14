import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const ActivityTracker: React.FC = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        if (user) {
          await axios.post('/api/auth/heartbeat', {}, { withCredentials: true });
        } else {
          await axios.post('/api/anonymous-heartbeat', {}, { withCredentials: true });
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval for regular heartbeats
    const heartbeatInterval = setInterval(sendHeartbeat, 30000); // every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [user]);

  return null;
};

export default ActivityTracker; 