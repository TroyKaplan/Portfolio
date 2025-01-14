import { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

const SubscriptionButton: React.FC = () => {
  useEffect(() => {
    // Check for session_id in URL
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get('session_id');

    if (sessionId) {
      // Clear the session_id from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Verify the session
      checkSession(sessionId);
    }
  }, []);

  const checkSession = async (sessionId: string) => {
    try {
      const response = await fetch('/api/verify-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (!response.ok) throw new Error('Session verification failed');
      
      // Refresh the page or update UI to show subscription status
      window.location.reload();
    } catch (error) {
      console.error('Session verification error:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) throw new Error('Stripe not loaded');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) throw error;
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <button 
      onClick={handleSubscribe}
      className="subscribe-button"
    >
      Subscribe Now
    </button>
  );
};

export default SubscriptionButton; 