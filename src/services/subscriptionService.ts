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
    const response = await axios.get('/api/subscription/status');
    const data = response.data;
    
    return {
      status: statusMap[data.subscription_status as StripeStatus] || data.subscription_status,
      endDate: data.subscription_end_date,
      startDate: data.subscription_start_date,
      customerId: data.stripe_customer_id,
      subscriptionId: data.subscription_id,
      role: data.role
    };
  }
}

export default SubscriptionService; 