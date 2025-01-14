export interface UserProfileData {
  username: string;
  email: string;
  role: string;
  created_at: string;
  subscription_status?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  total_playtime?: number;
  achievements?: Achievement[];
  subscription_id?: string;
  stripe_customer_id?: string;
  last_login?: string;
  total_time_spent?: number;
}

export interface Achievement {
  game_name: string;
  achievement_name: string;
  unlocked_at: string;
}

export interface GameStat {
  game_name: string;
  playtime: number;
  last_played: string;
  save_data: any;
}

export interface DeviceInfo {
  type: string;
  os: string;
  browser: string;
  screenWidth: number;
  screenHeight: number;
} 