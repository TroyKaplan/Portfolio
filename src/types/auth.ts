import { User } from './user';

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface DeviceInfo {
  screenResolution: string;
  timezone: string;
  language: string;
  userAgent?: string;
}

export type { User }; 