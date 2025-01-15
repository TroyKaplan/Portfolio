export interface VisitorStats {
  summary: {
    averageTotal: number;
    averageAuthenticated: number;
    averageAnonymous: number;
    peakConcurrent: number;
    newUsers: number;
    totalUsers: number;
  };
  dailyStats: Array<{
    date: string;
    total_users: number;
    authenticated_users: number;
    anonymous_users: number;
    peak_concurrent: number;
    new_users: number;
  }>;
} 