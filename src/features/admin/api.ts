import apiClient from '../../core/api/client';

export const adminApi = {
  getActiveUsers: () => apiClient.get('/api/active-users'),
  getVisitorStats: () => apiClient.get('/api/visitor-stats'),
  getUsers: () => apiClient.get('/api/users'),
  getUserDetails: (userId: string) => apiClient.get(`/api/users/${userId}`),
  updateRole: (userId: string, role: string) => apiClient.post('/api/update-role', { userId, role }),
  deleteUser: (userId: string) => apiClient.delete(`/api/users/${userId}`),
};

