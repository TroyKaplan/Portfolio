export type StripeStatus = 'incomplete' | 'incomplete_expired' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export const statusMap: Record<StripeStatus, string> = {
  'incomplete': 'pending',
  'incomplete_expired': 'inactive',
  'trialing': 'active',
  'active': 'active',
  'past_due': 'pending',
  'canceled': 'canceled',
  'unpaid': 'inactive'
}; 