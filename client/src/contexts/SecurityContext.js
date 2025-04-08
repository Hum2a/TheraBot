import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenManager, sessionManager } from '../utils/security';
import { secureApi } from '../utils/api';

const SecurityContext = createContext(null);

export const SecurityProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(tokenManager.isAuthenticated());
  const [sessionActive, setSessionActive] = useState(!!sessionManager.getSessionId());
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [securityHeaders, setSecurityHeaders] = useState({});

  // Session timeout (15 minutes)
  const SESSION_TIMEOUT = 15 * 60 * 1000;

  // Update last activity on user interaction
  const updateActivity = () => {
    setLastActivity(Date.now());
  };

  // Check session timeout
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity]);

  // Add activity listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Initialize security headers check
  useEffect(() => {
    const checkHeaders = async () => {
      try {
        const response = await secureApi.auth.checkHeaders();
        setSecurityHeaders(response.headers);
      } catch (error) {
        console.error('Failed to check security headers:', error);
      }
    };

    if (isAuthenticated) {
      checkHeaders();
    }
  }, [isAuthenticated]);

  // Handle login
  const handleLogin = async (credentials) => {
    try {
      const response = await secureApi.auth.login(credentials);
      const { token, user } = response.data;

      tokenManager.setToken(token);
      sessionManager.startSession();
      setIsAuthenticated(true);
      setSessionActive(true);
      setLastActivity(Date.now());

      return { success: true, user };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await secureApi.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.removeToken();
      sessionManager.endSession();
      setIsAuthenticated(false);
      setSessionActive(false);
    }
  };

  // Check security status
  const checkSecurity = () => {
    const missingHeaders = Object.entries(securityHeaders)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    return {
      isSecure: missingHeaders.length === 0,
      issues: missingHeaders
    };
  };

  const value = {
    isAuthenticated,
    sessionActive,
    lastActivity,
    handleLogin,
    handleLogout,
    checkSecurity,
    updateActivity
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export default SecurityContext; 