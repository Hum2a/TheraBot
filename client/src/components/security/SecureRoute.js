import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenManager, sessionManager } from '../../utils/security';

const SecureRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = tokenManager.isAuthenticated();
  const hasValidSession = sessionManager.getSessionId();

  // Check for authentication and valid session
  if (!isAuthenticated || !hasValidSession) {
    // Store the attempted URL for redirect after login
    sessionStorage.setItem('redirectUrl', location.pathname);
    
    // Redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default SecureRoute; 