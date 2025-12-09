import apiClient from '../core/api/client';
import { User, AuthError, DeviceInfo } from '../types/auth';
import axios from 'axios';

const createAuthError = (error: any): AuthError => {
  if (axios.isAxiosError(error)) {
    return {
      code: `AUTH_${error.response?.status || 'UNKNOWN'}`,
      message: error.response?.data?.message || 'Authentication failed',
      details: error.response?.data
    };
  }
  return {
    code: 'AUTH_UNKNOWN',
    message: 'An unexpected error occurred',
    details: error
  };
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  try {
    const response = await apiClient.get('/api/auth/current-user');
    return response.data;
  } catch (error: any) {
    throw createAuthError(error);
  }
};

export const login = async (
  username: string, 
  password: string, 
  deviceInfo: DeviceInfo
): Promise<{ user: User }> => {
  try {
    const response = await apiClient.post('/api/auth/login', { username, password, deviceInfo });
    return response.data;
  } catch (error: any) {
    throw createAuthError(error);
  }
}; 