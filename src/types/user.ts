interface GameStats {
  game_name: string;
  playtime: number;
  last_played: string;
  save_data: any;
  achievements: Achievement[];
}

interface Achievement {
  achievement_name: string;
  game_name: string;
  unlocked_at: string;
}

interface UserPreferences {
  settings: any;
}

interface User {
  id: string;
  username: string;
  password?: string;  // Optional since we don't always want to expose this
  role: 'user' | 'subscriber' | 'admin';
  created_at: string;
  last_login?: string;
  total_time_spent: number;
}

interface UserDetail extends User {
  device_info: {
    type: string;
    os: string;
    browser: string;
    screenWidth: number;
    screenHeight: number;
  };
  games: GameStats[];
  achievements: Achievement[];
  preferences: UserPreferences;
}

interface ActiveUser {
  username: string;
  last_seen: string;
}

export type {
  User,
  UserDetail,
  ActiveUser,
  GameStats,
  Achievement,
  UserPreferences
}; 