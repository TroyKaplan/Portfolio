import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { userService } from '../services/api';
import { getCurrentGame } from '../utils/gameTracker';

const ActivityTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const currentPage = location.pathname;
        const currentGame = getCurrentGame(); // Implement based on your game tracking
        
        const response = await userService.getCurrentUser();
        if (response.data.user) {
          await userService.sendHeartbeat({ currentPage, currentGame });
        } else {
          await userService.sendAnonymousHeartbeat({ currentPage });
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return null;
};

export default ActivityTracker; 