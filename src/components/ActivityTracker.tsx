import React, { useEffect } from 'react';
import axios from 'axios';

const ActivityTracker: React.FC = () => {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const response = await axios.get('/api/auth/current-user', { withCredentials: true });
        if (response.data.user) {
          await axios.post('/api/auth/heartbeat', {}, { withCredentials: true });
        } else {
          await axios.post('/api/anonymous-heartbeat', {}, { withCredentials: true });
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    sendHeartbeat(); // Initial heartbeat
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default ActivityTracker; 