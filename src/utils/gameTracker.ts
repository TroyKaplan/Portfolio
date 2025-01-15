export const getCurrentGame = (): string | undefined => {
  const path = window.location.pathname;
  if (path.startsWith('/games/')) {
    return path.split('/')[2]; // Returns game name from URL
  }
  return undefined;
}; 