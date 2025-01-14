const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const updateSubscriptionDetails = async (pool, userId, subscriptionId, status) => {
  try {
    const role = status === 'active' ? 'subscriber' : 'user';
    const result = await pool.query(
      `UPDATE users 
       SET subscription_status = $1, 
           subscription_id = $2,
           role = $3,
           subscription_start_date = CASE 
             WHEN subscription_start_date IS NULL THEN NOW() 
             ELSE subscription_start_date 
           END,
           subscription_end_date = CASE 
             WHEN $1 = 'active' THEN NULL 
             ELSE NOW() 
           END
       WHERE id = $4
       RETURNING *`,
      [status, subscriptionId, role, userId]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating subscription details:', error);
    throw error;
  }
};

module.exports = {
  updateSubscriptionDetails
}; 