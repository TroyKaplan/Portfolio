import { statusMap, StripeStatus } from '../types/subscription';
import { pool as db } from '../config/database';
import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const updateSubscriptionStatus = async (
  subscriptionId: string, 
  status: string
): Promise<void> => {
  console.log('[StripeService:updateSubscriptionStatus]', {
    subscriptionId,
    originalStatus: status,
    mappedStatus: statusMap[status as StripeStatus] || status
  });

  await db.query(
    `UPDATE users 
     SET subscription_status = $1,
         subscription_updated_at = NOW()
     WHERE subscription_id = $2`,
    [statusMap[status as StripeStatus] || status, subscriptionId]
  );
}; 