import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

interface PaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      console.error('Stripe not initialized');
      return;
    }

    setIsProcessing(true);
    console.log('[PaymentForm] Processing payment...');

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/profile?payment_success=true`,
        },
        redirect: 'if_required'
      });

      console.log('[PaymentForm] Payment result:', result);

      if (result.error) {
        console.error('[PaymentForm] Payment error:', result.error);
        onError(result.error.message || 'Payment failed');
      } else {
        // Check if payment requires additional actions
        if (result.paymentIntent?.status === 'requires_action') {
          console.log('[PaymentForm] Payment requires additional action');
          // The payment will be handled by the redirect
          return;
        }
        
        // Payment succeeded
        if (result.paymentIntent?.status === 'succeeded') {
          console.log('[PaymentForm] Payment succeeded:', result.paymentIntent);
          onSuccess();
        } else {
          console.log('[PaymentForm] Unexpected payment status:', result.paymentIntent?.status);
          onError('Payment status unclear. Please check your account.');
        }
      }
    } catch (err) {
      console.error('[PaymentForm] Unexpected error:', err);
      onError('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button 
        type="submit" 
        disabled={isProcessing}
        className="payment-button"
      >
        {isProcessing ? 'Processing...' : 'Subscribe Now'}
      </button>
    </form>
  );
};

interface SubscriptionPaymentProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const SubscriptionPayment: React.FC<SubscriptionPaymentProps> = ({ 
  clientSecret, 
  onSuccess, 
  onError 
}) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm 
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default SubscriptionPayment; 