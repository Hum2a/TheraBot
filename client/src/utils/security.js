import SecureLS from 'secure-ls';
import DOMPurify from 'dompurify';

// Initialize secure local storage
const ls = new SecureLS({
  encodingType: 'aes',
  isCompression: false,
  encryptionSecret: process.env.REACT_APP_STORAGE_KEY || 'your-fallback-key'
});

// Secure storage operations
export const secureStorage = {
  set: (key, value) => {
    try {
      ls.set(key, value);
    } catch (error) {
      console.error('Error setting secure storage:', error);
    }
  },
  get: (key) => {
    try {
      return ls.get(key);
    } catch (error) {
      console.error('Error getting from secure storage:', error);
      return null;
    }
  },
  remove: (key) => {
    try {
      ls.remove(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
  clear: () => {
    try {
      ls.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }
};

// XSS Prevention
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [] // No attributes allowed
  });
};

// Token handling
export const tokenManager = {
  getToken: () => secureStorage.get('authToken'),
  setToken: (token) => secureStorage.set('authToken', token),
  removeToken: () => secureStorage.remove('authToken'),
  isAuthenticated: () => !!secureStorage.get('authToken')
};

// Session security
export const sessionManager = {
  startSession: () => {
    const sessionId = crypto.randomUUID();
    secureStorage.set('sessionId', sessionId);
    return sessionId;
  },
  getSessionId: () => secureStorage.get('sessionId'),
  endSession: () => {
    secureStorage.remove('sessionId');
    tokenManager.removeToken();
  }
};

// Input validation
export const validateInput = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  password: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },
  phone: (phone) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  }
};

// Security headers check
export const checkSecurityHeaders = (headers) => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Content-Security-Policy'
  ];

  const missingHeaders = requiredHeaders.filter(header => !headers[header.toLowerCase()]);
  if (missingHeaders.length > 0) {
    console.warn('Missing security headers:', missingHeaders);
    return false;
  }
  return true;
};

// URL sanitization
export const sanitizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      window.location.hostname,
      'api.openai.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];
    
    if (!allowedDomains.includes(parsed.hostname)) {
      throw new Error('Invalid domain');
    }
    
    return parsed.toString();
  } catch (error) {
    console.error('Invalid URL:', error);
    return '';
  }
}; 