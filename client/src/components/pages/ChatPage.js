import React from 'react';
import Chatbot from '../widgets/Chatbot';
import styles from '../styles/ChatPage.module.css';

const ChatPage = () => (
  <div className={styles.page}>
    <div className={styles.container}>
      <h2>Welcome to TheraBot!</h2>
      <Chatbot />
    </div>
  </div>
);

export default ChatPage;
