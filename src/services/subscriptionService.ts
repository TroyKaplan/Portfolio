import axios from 'axios';
import { StripeStatus, statusMap } from '../types/subscription';

interface SubscriptionStatus {
  status: string;
  endDate?: string;
  startDate?: string;
  customerId?: string;
  subscriptionId?: string;
  role?: string;
}

class SubscriptionService {
  static async getCurrentStatus(): Promise<SubscriptionStatus> {
    try {
      console.log('Fetching subscription status...');
      const response = await axios.get('/api/subscription/status');
      console.log('Raw subscription response:', response.data);
      
      const mappedStatus = {
        status: statusMap[response.data.subscription_status as StripeStatus] || response.data.subscription_status || 'inactive',
        endDate: response.data.subscription_end_date,
        startDate: response.data.subscription_start_date,
        customerId: response.data.stripe_customer_id,
        subscriptionId: response.data.subscription_id,
        role: response.data.role
      };
      
      console.log('Mapped subscription status:', mappedStatus);
      return mappedStatus;
    } catch (error) {
      console.error('Error fetching subscription status:', {
        error,
        isAxiosError: axios.isAxiosError(error),
        response: axios.isAxiosError(error) ? error.response?.data : null
      });
      // Return default status on error
      return {
        status: 'inactive',
        role: 'user'
      };
    }
  }
}

export default SubscriptionService; 