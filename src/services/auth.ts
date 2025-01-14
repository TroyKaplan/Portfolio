import axios from 'axios';
import { DeviceInfo } from '../types/device';

interface AuthError {
  code?: string;
  message: string;
}

const handleError = (error: any): never => {
  if (error.response?.data?.code === '23505') {
    // PostgreSQL unique violation error
    throw new Error('Username already exists');
  }
  throw error.response?.data || error;
};

const AUTH_API = '/api/auth';

export const login = async (username: string, password: string, deviceInfo: DeviceInfo) => {
  try {
    const response = await axios.post(`${AUTH_API}/login`, { username, password, deviceInfo });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const register = async (username: string, password: string, deviceInfo: DeviceInfo) => {
  try {
    const response = await axios.post(`${AUTH_API}/register`, { username, password, deviceInfo });
    return response.data;
  } catch (error: any) {
    throw handleError(error);
  }
};

export const logout = async () => {
  try {
    await axios.post(`${AUTH_API}/logout`);
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await axios.get(`${AUTH_API}/current-user`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error.message;
    }
    throw 'An unknown error occurred';
  }
}; 