import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSecurity } from '../contexts/SecurityContext';
import SecureRoute from '../components/security/SecureRoute';
import Navbar from '../components/ui/Navbar';

// Import pages
import LoginPage from '../components/pages/LoginPage';
import Dashboard from '../components/pages/Dashboard';
import ChatPage from '../components/pages/ChatPage';
import ProfilePage from '../components/pages/ProfilePage';
import ConversationHistory from '../components/pages/ConversationHistory';
import SettingsPage from '../components/pages/SettingsPage';

const Navigation = () => {
  const { isAuthenticated, sessionActive, updateActivity } = useSecurity();

  // Update activity on route change
  useEffect(() => {
    updateActivity();
  }, [updateActivity]);

  return (
    <Router>
      {/* Show Navbar only for authenticated users */}
      {isAuthenticated && sessionActive && <Navbar />}
      
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated && sessionActive ? 
              <Navigate to="/dashboard" replace /> : 
              <LoginPage />
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <SecureRoute>
              <Dashboard />
            </SecureRoute>
          }
        />
        
        <Route
          path="/chat"
          element={
            <SecureRoute>
              <ChatPage />
            </SecureRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <SecureRoute>
              <ProfilePage />
            </SecureRoute>
          }
        />
        
        <Route
          path="/history"
          element={
            <SecureRoute>
              <ConversationHistory />
            </SecureRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <SecureRoute>
              <SettingsPage />
            </SecureRoute>
          }
        />

        {/* Default Routes */}
        <Route
          path="/"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Catch all route - redirect to appropriate page based on auth status */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default Navigation;
