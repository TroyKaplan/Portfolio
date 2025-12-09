import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import '../styles/SubscriptionPage.css';

//React App Public Key
const stripePromise = loadStripe('pk_test_51Qh3UCJKgTs5JaetoL0jvzw1223PGavZxuPC8Fn8jXUEQblYqfqnhav9T6hAtzElVRUYq0S4RprTxJlftIPDdbg300iIE1OxF6');

const SubscriptionPage: React.FC = () => {
  return (
    <div className="subscription-page">
      <h1>Game Subscription</h1>
      
      <div className="subscription-grid">
        <div className="subscription-card info-card">
          <h2>Subscription Benefits</h2>
          <ul className="benefits-list">
            <li>Place Holder</li>
            <li>Place Holder</li>
            <li>Do not subscribe right now</li>
            <li>Testing Testing Testing.</li>
          </ul>
          
          <div className="pricing-info">
            <h3>Pricing</h3>
            <div className="price-tag">$10.00 / quarter</div>
            <p className="price-note">Billed every 3 months - Cancel anytime</p>
          </div>
        </div>

        <div className="subscription-card checkout-card">
          <h2>Secure Checkout</h2>
          <Elements stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;

