import axios from 'axios';

export const checkSubscriptionStatus = async () => {
  try {
    const response = await axios.get('/api/subscription/status', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return null;
  }
};


export const cancelSubscription = async () => {
  try {
    const response = await axios.post('/api/subscription/cancel', {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
}; 