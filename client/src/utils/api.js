import axios from 'axios';
import axiosRetry from 'axios-retry';
import { tokenManager, checkSecurityHeaders, sanitizeUrl } from './security';

const api = axios.create({
  // baseURL: sanitizeUrl(process.env.REACT_APP_API_URL || 'http://localhost:3001'),
  baseURL: 'https://2377-92-40-174-2.ngrok-free.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Enable cookies for sessions
});

// Configure retry logic
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.response?.status === 429; // Retry on rate limit
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Validate and sanitize URL
    if (config.url) {
      config.url = sanitizeUrl(config.url);
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Check security headers
    checkSecurityHeaders(response.headers);
    return response;
  },
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        tokenManager.removeToken();
        window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden');
      }

      // Handle rate limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter) {
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return api.request(error.config);
        }
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints with built-in security
export const secureApi = {
  // Auth endpoints
  auth: {
    login: async (credentials) => {
      return api.post('/auth/login', credentials);
    },
    register: async (userData) => {
      return api.post('/auth/register', userData);
    },
    logout: async () => {
      const response = await api.post('/auth/logout');
      tokenManager.removeToken();
      return response;
    }
  },

  // Chat endpoints
  chat: {
    initialize: async (sessionData) => {
      return api.post('/chat/initialize-session', sessionData);
    },
    sendMessage: async (message) => {
      return api.post('/chat/webhook', message);
    },
    getHistory: async (sessionId) => {
      return api.get(`/chat/history?sessionId=${sessionId}`);
    },
    deleteSession: async (sessionId) => {
      return api.delete(`/chat/session/${sessionId}`);
    }
  },

  // OTP endpoints
  otp: {
    send: async (phoneNumber) => {
      return api.post('/otp/send', { phone: phoneNumber });
    },
    verify: async (phoneNumber, code) => {
      return api.post('/otp/verify', { phone: phoneNumber, code });
    }
  }
};

export default api; 