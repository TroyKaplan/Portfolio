import apiClient from '../../core/api/client';

export const createSubscription = async (payload: { paymentMethodId: string; cancelAtPeriodEnd?: boolean }) => {
  const response = await apiClient.post('/api/create-subscription', payload);
  return response.data;
};

