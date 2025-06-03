import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/NotFoundPage.module.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Page Not Found</h2>
      <p className={styles.message}>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <button 
        className={styles.button}
        onClick={() => navigate('/dashboard')}
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default NotFoundPage; 