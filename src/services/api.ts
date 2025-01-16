import axios from 'axios';

const api = axios.create({
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const trackGameClick = async (gameId: string) => {
  try {
    await axios.post('/api/track-game-click', { gameId });
  } catch (error) {
    console.error('Failed to track game click:', error);
  }
};

export const userService = {
  getCurrentUser: () => api.get('/api/auth/current-user'),
  getActiveUsers: () => api.get('/api/active-users'),
  getVisitorStats: () => api.get('/api/visitor-stats'),
  updateRole: (userId: string, role: string) => 
    api.post('/api/update-role', { userId, role }),
  sendHeartbeat: (data: { currentPage: string }) => 
    api.post('/api/auth/heartbeat', data),
  sendAnonymousHeartbeat: (data: { currentPage: string }) => 
    api.post('/api/anonymous-heartbeat', data),
  deleteUser: (userId: string) => 
    api.delete(`/api/users/${userId}`)
}; 