import apiClient from '../../core/api/client';

/**
 * Track a game click for analytics.
 * Currently used when a user opens a game from the UI.
 */
export const trackGameClick = async (gameId: string) => {
  await apiClient.post('/api/track-game-click', { gameId });
};

