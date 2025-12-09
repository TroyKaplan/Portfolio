import axios from 'axios';

/**
 * Shared axios client with sensible defaults for this app.
 * - withCredentials: supports session-based auth used by the backend.
 * - Accept/Content-Type JSON headers across requests.
 */
export const apiClient = axios.create({
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export default apiClient;

