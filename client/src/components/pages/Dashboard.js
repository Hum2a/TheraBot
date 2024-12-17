import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <h2>Welcome to Your Dashboard</h2>
      <div className={styles.options}>
        <Link to="/profile" className={styles.optionCard}>
          <h3>Profile</h3>
          <p>Manage your personal details</p>
        </Link>
        <Link to="/chat" className={styles.optionCard}>
          <h3>Chat</h3>
          <p>Start chatting with TheraBot</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
