require('dotenv').config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createSubscription = async (customerId, priceId) => {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
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

const updateSubscriptionDetails = async (userId, stripeCustomerId, subscriptionId, status) => {
  try {
    const result = await pool.query(
      `UPDATE users 
       SET stripe_customer_id = $1,
           subscription_id = $2, 
           subscription_status = $3,
           role = $4,
           subscription_start_date = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [stripeCustomerId, subscriptionId, status, status === 'active' ? 'subscriber' : 'user', userId]
    );
    
    if (!result.rows[0]) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating subscription details:', error);
    throw error;
  }
};

module.exports = {
  createSubscription,
  createCustomer,
  updateCustomer,
  updateSubscriptionDetails
}; 