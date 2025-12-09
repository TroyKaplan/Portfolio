export type AccessLevel = 'public' | 'subscriber';
export type Role = 'user' | 'subscriber' | 'admin';

interface AccessUser {
  role: Role;
}

interface GameAccessContext {
  user: AccessUser | null;
  access: AccessLevel;
  isMultiplayer?: boolean;
}

/**
 * Centralized rule for determining if a user can launch a game.
 * - Multiplayer games require an authenticated user.
 * - Public games are open unless marked multiplayer.
 * - Subscriber games require subscriber or admin roles.
 */
export const canUserAccessGame = ({
  user,
  access,
  isMultiplayer = false,
}: GameAccessContext): boolean => {
  if (isMultiplayer) {
    return Boolean(user);
  }

  if (access === 'public') return true;
  if (!user) return false;

  // subscriber-only content
  return user.role === 'subscriber' || user.role === 'admin';
};

