import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import './CheckoutForm.css';

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#999999' : '#666666',
        },
        ':-webkit-autofill': {
          color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ff4444',
        iconColor: '#ff4444'
      }
    },
    hidePostalCode: false,
  };

  useEffect(() => {
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.update({
          style: {
            base: {
              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#ffffff' : '#000000',
              '::placeholder': {
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#999999' : '#666666',
              }
            }
          }
        });
      }
    }
  }, [elements, document.documentElement.getAttribute('data-theme')]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setProcessing(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        setError(error.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paymentMethodId: paymentMethod.id,
          cancelAtPeriodEnd: false
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = '/games';
      } else {
        setError(data.error || 'Subscription failed');
      }
    } catch (err) {
      setError('Subscription failed. Please try again.');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-container">
        <CardElement options={cardElementOptions} />
      </div>
      {error && <div className="error-message">{error}</div>}
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="subscribe-button"
      >
        {processing ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
};

export default CheckoutForm; 