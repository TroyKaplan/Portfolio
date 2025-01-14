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
  const customer = await stripe.customers.create({
    email,
    payment_method: paymentMethodId,
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Store customer ID in database
  await pool.query(
    'UPDATE users SET stripe_customer_id = $1 WHERE email = $2',
    [customer.id, email]
  );

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

module.exports = {
  createSubscription,
  createCustomer,
  updateCustomer,
}; 