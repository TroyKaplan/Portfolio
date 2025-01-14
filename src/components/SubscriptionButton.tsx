import React, { useState } from 'react';
import SubscriptionPayment from './SubscriptionPayment';

const SubscriptionButton: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      console.log('[SubscriptionButton] Initiating subscription...');
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create subscription');

      const data = await response.json();
      console.log('[SubscriptionButton] Subscription created:', data);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('[SubscriptionButton] Error:', error);
      setError('Failed to start subscription process');
    }
  };

  const handlePaymentSuccess = () => {
    console.log('[SubscriptionButton] Payment successful');
    window.location.reload();
  };

  const handlePaymentError = (error: string) => {
    console.error('[SubscriptionButton] Payment error:', error);
    setError(error);
    setClientSecret(null);
  };

  if (clientSecret) {
    return (
      <SubscriptionPayment
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    );
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <button onClick={handleSubscribe} className="subscribe-button">
        Subscribe Now
      </button>
    </div>
  );
};

export default SubscriptionButton; 