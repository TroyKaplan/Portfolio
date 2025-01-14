require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createSubscription = async (customerId, priceId) => {
  console.log('[StripeService:createSubscription] Creating subscription...', { customerId, priceId });
  
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      }
    });

    console.log('[StripeService:createSubscription] Subscription created:', {
      id: subscription.id,
      status: subscription.status,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      status: subscription.status
    };
  } catch (error) {
    console.error('[StripeService:createSubscription] Error:', error);
    throw error;
  }
};

const createCustomer = async (email, paymentMethodId, pool) => {
  console.log('Creating customer with email:', email);
  const customer = await stripe.customers.create({
    email,
    payment_method: paymentMethodId,
    invoice_settings: { default_payment_method: paymentMethodId },
  });
  console.log('Stripe customer created:', customer.id);

  const result = await pool.query(
    'UPDATE users SET stripe_customer_id = $1, email = $2 WHERE email = $3 RETURNING *',
    [customer.id, email, email]
  );
  console.log('Database updated with customer ID:', result.rows[0]);

  return customer;
};

const updateCustomer = async (userId, customerId) => {
  try {
    await pool.query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customerId, userId]
    );
    console.log(`Updated user ${userId} with Stripe customer ID ${customerId}`);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

const updateSubscriptionDetails = async (pool, userId, subscriptionId, status) => {
  const logPrefix = `[StripeService:updateSubscriptionDetails] [UserID: ${userId}]`;
  console.log(`${logPrefix} Starting subscription update...`, {
    userId,
    subscriptionId,
    originalStatus: status
  });
  
  try {
    // Map Stripe status to our internal status
    const subscriptionStatus = status === 'active' ? 'active' : 
                             status === 'trialing' ? 'active' :
                             status === 'past_due' ? 'past_due' :
                             status === 'canceled' ? 'inactive' : 
                             status === 'unpaid' ? 'inactive' : 
                             status === 'incomplete_expired' ? 'inactive' : 
                             status === 'incomplete' ? 'pending' : status;
    
    const role = subscriptionStatus === 'active' ? 'subscriber' : 'user';
    
    console.log(`${logPrefix} Mapped status:`, { 
      original: status, 
      mapped: subscriptionStatus, 
      role,
      subscriptionId 
    });

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
             WHEN $1 IN ('inactive', 'canceled') THEN NOW() 
             ELSE subscription_end_date 
           END
       WHERE id = $4
       RETURNING subscription_status, role, subscription_id, subscription_start_date, subscription_end_date`,
      [subscriptionStatus, subscriptionId, role, userId]
    );
    
    if (!result.rows[0]) {
      throw new Error('User not found');
    }
    
    console.log(`${logPrefix} Update successful:`, result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error(`${logPrefix} Error updating subscription:`, error);
    throw error;
  }
};

module.exports = {
  createSubscription,
  createCustomer,
  updateCustomer,
  updateSubscriptionDetails
}; 