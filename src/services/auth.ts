import axios from 'axios';
import { User, AuthError, DeviceInfo } from '../types/auth';

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
    const response = await axios.get('/api/auth/current-user', {
      withCredentials: true
    });
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
    const response = await axios.post('/api/auth/login', 
      { username, password, deviceInfo },
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    throw createAuthError(error);
  }
}; 