import apiClient from '../core/api/client';

export const userService = {
  getCurrentUser: () => apiClient.get('/api/auth/current-user'),
  getActiveUsers: () => apiClient.get('/api/active-users'),
  getVisitorStats: () => apiClient.get('/api/visitor-stats'),
  updateRole: (userId: string, role: string) => 
    apiClient.post('/api/update-role', { userId, role }),
  sendHeartbeat: (data: { currentPage: string }) => 
    apiClient.post('/api/auth/heartbeat', data),
  sendAnonymousHeartbeat: (data: { currentPage: string }) => 
    apiClient.post('/api/anonymous-heartbeat', data),
  deleteUser: (userId: string) => 
    apiClient.delete(`/api/users/${userId}`)
}; 