export const ROLES = ['user', 'subscriber', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const ACCESS_LEVELS = ['public', 'subscriber'] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

