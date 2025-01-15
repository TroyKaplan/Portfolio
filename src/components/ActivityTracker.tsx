import React, { useEffect } from 'react';
import { userService } from '../services/api';

const ActivityTracker: React.FC = () => {
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const response = await userService.getCurrentUser();
        if (response.data.user) {
          await userService.sendHeartbeat();
        } else {
          await userService.sendAnonymousHeartbeat();
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