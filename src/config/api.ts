const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiEndpoints = {
    activeUsers: `${API_BASE_URL}/api/active-users`,
    visitorStats: `${API_BASE_URL}/api/visitor-stats`
};

export default API_BASE_URL; 