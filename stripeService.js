const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const updateSubscriptionDetails = async (pool, userId, subscriptionId, status) => {
  const logPrefix = `[StripeService:updateSubscriptionDetails] [UserID: ${userId}]`;
  console.log(`${logPrefix} Starting subscription update...`);
  console.log(`${logPrefix} Input parameters:`, { userId, subscriptionId, status });
  
  try {
    // Map Stripe status to our internal status
    const subscriptionStatus = status === 'active' ? 'active' : 
                             status === 'canceled' ? 'inactive' : 
                             status === 'unpaid' ? 'inactive' : 
                             status === 'incomplete_expired' ? 'inactive' : status;
    
    console.log(`${logPrefix} Mapped subscription status from '${status}' to '${subscriptionStatus}'`);
    
    const role = subscriptionStatus === 'active' ? 'subscriber' : 'user';
    console.log(`${logPrefix} Determined role:`, role);
    
    console.log(`${logPrefix} Executing database update query...`);
    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = $1, 
           subscription_id = $2,
           role = $3,
           subscription_start_date = CASE 
             WHEN $1 = 'active' AND subscription_start_date IS NULL THEN NOW() 
             ELSE subscription_start_date 
           END,
           subscription_end_date = CASE 
             WHEN $1 = 'active' THEN NULL 
             WHEN $1 = 'inactive' THEN NOW() 
             ELSE subscription_end_date 
           END
       WHERE id = $4
       RETURNING *`,
      [subscriptionStatus, subscriptionId, role, userId]
    );
    
    if (!result.rows[0]) {
      console.error(`${logPrefix} No user found with ID ${userId}`);
      throw new Error('User not found');
    }
    
    console.log(`${logPrefix} Database update successful`);
    console.log(`${logPrefix} Updated user details:`, {
      id: result.rows[0].id,
      role: result.rows[0].role,
      subscription_status: result.rows[0].subscription_status,
      subscription_id: result.rows[0].subscription_id,
      subscription_start_date: result.rows[0].subscription_start_date,
      subscription_end_date: result.rows[0].subscription_end_date
    });
    
    return result.rows[0];
  } catch (error) {
    console.error(`${logPrefix} Error occurred:`, error);
    console.error(`${logPrefix} Error stack:`, error.stack);
    throw error;
  }
};

module.exports = {
  updateSubscriptionDetails
}; 