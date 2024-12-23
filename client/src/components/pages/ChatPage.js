import React, { useState, useEffect } from 'react';
import Chatbot from '../widgets/Chatbot';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../styles/ChatPage.module.css';

const ChatPage = () => {
  const [botSettings, setBotSettings] = useState({
    role: 'Loading...',
    tone: 'Loading...',
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get the current user from Firebase Authentication
    const fetchUser = () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
      } else {
        console.error('No authenticated user found.');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchBotSettings = async () => {
      if (!user) return; // Ensure user is loaded before fetching settings

      try {
        // Reference to the user's preferences document
        const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();

          // Check if custom role and tone are enabled
          const role = data.personalization.role;
          const tone = data.personalization.tone;

          setBotSettings({ role, tone });
        } else {
          console.error('Preferences document not found.');
          setBotSettings({ role: 'Unavailable', tone: 'Unavailable' });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        setBotSettings({ role: 'Error', tone: 'Error' });
      }
    };

    if (user) fetchBotSettings();
  }, [user]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h2>Welcome to TheraBot!</h2>
        <div className={styles.settings}>
          <div className={styles.settingItem}>
            <strong>Role:</strong> {botSettings.role}
          </div>
          <div className={styles.settingItem}>
            <strong>Tone:</strong> {botSettings.tone}
          </div>
        </div>
        <Chatbot />
      </div>
    </div>
  );
};

export default ChatPage;
