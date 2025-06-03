import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';

// Import pages
import LoginPage from '../components/pages/LoginPage';
import Dashboard from '../components/pages/Dashboard';
import ChatPage from '../components/pages/ChatPage';
import ProfilePage from '../components/pages/ProfilePage';
import ConversationHistory from '../components/pages/ConversationHistory';
import SettingsPage from '../components/pages/SettingsPage';
import NotFoundPage from '../components/pages/NotFoundPage';

const Navigation = () => {
  return (
    <Router>
      <Navbar />
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<ConversationHistory />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default Navigation;
