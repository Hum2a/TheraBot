import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import { auth } from '../../firebase/firebase';
import styles from '../styles/Navbar.module.css';

// Check if running on localhost
const isLocalhost = () => {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
};

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show navbar when not authenticated
  }

  return (
    <nav className={styles.navbar}>
      <Link to="/dashboard" className={styles.logoContainer}>
        <FiMessageSquare size={24} />
        <span className={styles.brandName}>TheraBot</span>
        <img
          src="/therabot.png"
          className={styles.logo}
          alt="TheraBot Logo"
        />
      </Link>
      <div className={styles.links}>
        <Link to="/dashboard" className={styles.link}>Dashboard</Link>
        <Link to="/chat" className={styles.link}>Chat</Link>
        <Link to="/profile" className={styles.link}>Profile</Link>
        <Link to="/history" className={styles.link}>Conversation History</Link>
        <Link to="/settings" className={styles.link}>Settings</Link>
        {isLocalhost() && (
          <Link to="/developer" className={styles.link}>Developer</Link>
        )}
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
