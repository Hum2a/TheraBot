import React from 'react';
import { Link } from 'react-router-dom';
import { FiMessageSquare } from 'react-icons/fi';
import { auth } from '../../firebase/firebase';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
      alert('You have been logged out.');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <FiMessageSquare size={24} />
        <span>TheraBot</span>
      </div>
      <div className={styles.links}>
        <Link to="/dashboard" className={styles.link}>Dashboard</Link>
        <Link to="/chat" className={styles.link}>Chat</Link>
        <Link to="/profile" className={styles.link}>Profile</Link>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
