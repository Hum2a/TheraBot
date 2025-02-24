import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  return (
    <div className={styles.container}>
      <h2>Welcome to Your Safe Space</h2>
      <div className={styles.options}>
        <Link to="/profile" className={styles.optionCard}>
          <h3>Your Profile</h3>
          <p>Customize your personal space and preferences</p>
        </Link>
        <Link to="/chat" className={styles.optionCard}>
          <h3>Start a Conversation</h3>
          <p>Connect with TheraBot in a safe, judgment-free environment</p>
        </Link>
        <Link to="/history" className={styles.optionCard}>
          <h3>Your Journey</h3>
          <p>Reflect on your progress and past conversations</p>
        </Link>
        <Link to="/settings" className={styles.optionCard}>
          <h3>Comfort Settings</h3>
          <p>Adjust your experience to what feels right for you</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
