import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import styles from '../styles/SettingsPage.module.css';

const SettingsPage = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'English',
    accessibility: {
      textToSpeech: false,
      speechToText: false,
      textSize: 'medium',
    },
    chatInterface: {
      typingIndicator: true,
      userAvatar: true,
    },
    personalization: {
      nickname: '',
      tone: 'empathetic',
      role: 'therapist',
    },
    useCustomTone: false,
    useCustomRole: false,
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      const authUser = auth.currentUser;
      if (authUser) {
        setUser(authUser);
        const docRef = doc(db, `users/${authUser.uid}/settings/preferences`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPreferences(docSnap.data());
        }
      }
    };
    fetchPreferences();
  }, []);

  const handleSave = async () => {
    if (user) {
      try {
        const docRef = doc(db, `users/${user.uid}/settings/preferences`);
        await setDoc(docRef, preferences);
        alert('Preferences saved successfully!');
      } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences.');
      }
    } else {
      alert('User not authenticated.');
    }
  };

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      personalization: {
        ...prev.personalization,
        [key]: value,
      },
    }));
  };

  const toggleCustomOption = (key, checked) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>

      {/* Chatbot Settings */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Chatbot</legend>

        {/* Tone */}
        <label className={styles.label}>
          Tone:
          <select
            className={styles.select}
            value={preferences.personalization.tone}
            onChange={(e) =>
              updatePreference('tone', e.target.value)
            }
            disabled={preferences.useCustomTone}
          >
            <option value="empathetic">Empathetic</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="humorous">Humorous</option>
            <option value="serious">Serious</option>
            <option value="bitchy">Bitchy</option>
          </select>
        </label>

        <label className={styles.label}>
          <input
            type="checkbox"
            checked={preferences.useCustomTone}
            onChange={(e) => toggleCustomOption('useCustomTone', e.target.checked)}
          />
          Use Custom Tone
        </label>

        <label className={styles.label}>
          Custom Tone:
          <input
            type="text"
            placeholder="Enter custom tone"
            className={styles.input}
            value={preferences.personalization.tone}
            onChange={(e) => updatePreference('tone', e.target.value)}
            disabled={!preferences.useCustomTone}
          />
        </label>

        {/* Role */}
        <label className={styles.label}>
          Role:
          <select
            className={styles.select}
            value={preferences.personalization.role}
            onChange={(e) =>
              updatePreference('role', e.target.value)
            }
            disabled={preferences.useCustomRole}
          >
            <option value="therapist">Therapist</option>
            <option value="best friend">Best Friend</option>
            <option value="ceo">CEO</option>
            <option value="girlfriend">Girlfriend</option>
            <option value="wife">Wife</option>
            <option value="boyfriend">Boyfriend</option>
            <option value="husband">Husband</option>
            <option value="dad">Dad</option>
            <option value="mother">Mother</option>
            <option value="brother">Brother</option>
            <option value="sister">Sister</option>
            <option value="son">Son</option>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="mortal enemy">Mortal Enemy</option>
            <option value="ex">Ex</option>
          </select>
        </label>

        <label className={styles.label}>
          <input
            type="checkbox"
            checked={preferences.useCustomRole}
            onChange={(e) => toggleCustomOption('useCustomRole', e.target.checked)}
          />
          Use Custom Role
        </label>

        <label className={styles.label}>
          Custom Role:
          <input
            type="text"
            placeholder="Enter custom role"
            className={styles.input}
            value={preferences.personalization.role}
            onChange={(e) => updatePreference('role', e.target.value)}
            disabled={!preferences.useCustomRole}
          />
        </label>
      </fieldset>

      {/* Account Settings */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Account</legend>
        <label className={styles.label}>
          Nickname:
          <input
            type="text"
            className={styles.input}
            value={preferences.personalization.nickname}
            onChange={(e) => updatePreference('nickname', e.target.value)}
          />
        </label>
      </fieldset>

      <button className={styles.button} onClick={handleSave}>
        Save Preferences
      </button>
    </div>
  );
};

export default SettingsPage;
