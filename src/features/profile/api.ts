import apiClient from '../../core/api/client';
import { UserProfileData } from '../../types/interfaces';

export const getProfile = async (): Promise<UserProfileData> => {
  const response = await apiClient.get('/api/user/profile');
  return response.data;
};

export const updateEmail = async (email: string) => {
  const response = await apiClient.post('/api/user/update-email', { email });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  const response = await apiClient.post('/api/user/change-password', { currentPassword, newPassword });
  return response.data;
};

