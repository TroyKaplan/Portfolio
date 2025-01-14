import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import './SubscriptionPage.css';

const stripePromise = loadStripe('pk_test_51Qh3UCJKgTs5JaetoL0jvzw1223PGavZxuPC8Fn8jXUEQblYqfqnhav9T6hAtzElVRUYq0S4RprTxJlftIPDdbg300iIE1OxF6');

const SubscriptionPage: React.FC = () => {
  return (
    <div className="subscription-page">
      <h1>Game Subscription</h1>
      
      <div className="subscription-grid">
        <div className="subscription-card info-card">
          <h2>Subscription Benefits</h2>
          <ul className="benefits-list">
            <li>Access to all premium games</li>
            <li>Early access to new releases</li>
            <li>Save game progress across devices</li>
            <li>Ad-free gaming experience</li>
          </ul>
          
          <div className="pricing-info">
            <h3>Pricing</h3>
            <div className="price-tag">$5.99 / month</div>
            <p className="price-note">Cancel anytime</p>
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