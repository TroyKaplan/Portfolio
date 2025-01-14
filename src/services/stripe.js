require('dotenv').config();
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

module.exports = {
  createSubscription,
  createCustomer,
}; 