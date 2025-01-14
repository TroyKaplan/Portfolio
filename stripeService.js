const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('./db'); // Adjust path as needed

const updateSubscriptionDetails = async (userId, customerId, subscriptionId, status) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const currentPeriodStart = new Date(subscription.current_period_start * 1000);
    
    await pool.query(
      `UPDATE users 
       SET subscription_id = $1,
           subscription_status = $2,
           subscription_end_date = $3,
           subscription_start_date = $4,
           role = $5
       WHERE id = $6`,
      [
        subscriptionId,
        status,
        currentPeriodEnd,
        currentPeriodStart,
        status === 'active' ? 'subscriber' : 'user',
        userId
      ]
    );
  } catch (error) {
    console.error('Error updating subscription details:', error);
    throw error;
  }
};

module.exports = {
  updateSubscriptionDetails
}; 