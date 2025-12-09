import apiClient from '../../core/api/client';
import { User } from '../../types/auth';
import { DeviceInfo } from '../../types/auth';

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await apiClient.get('/api/auth/current-user');
  return response.data;
};

export const login = async (username: string, password: string, deviceInfo: DeviceInfo): Promise<{ user: User }> => {
  const response = await apiClient.post('/api/auth/login', { username, password, deviceInfo });
  return response.data;
};

export const register = async (payload: { username: string; email?: string; password: string }) => {
  const response = await apiClient.post('/api/auth/register', payload);
  return response.data;
};

