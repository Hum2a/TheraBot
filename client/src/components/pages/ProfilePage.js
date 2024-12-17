import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ProfilePage.module.css';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const user = auth.currentUser;

  // Fetch user profile from Firestore
  const fetchProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, `users/${user.uid}/profile`);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        setNumber(profileData.number || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Save updated profile to Firestore
  const handleSave = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, `users/${user.uid}/profile`);
      await setDoc(userRef, { name, email, number }, { merge: true });
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2>Profile</h2>
      {!isEditing ? (
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Name</h3>
            <p>{name}</p>
          </div>
          <div className={styles.card}>
            <h3>Email</h3>
            <p>{email}</p>
          </div>
          <div className={styles.card}>
            <h3>Number</h3>
            <p>{number}</p>
          </div>
          <button onClick={() => setIsEditing(true)} className={styles.editButton}>
            Edit
          </button>
        </div>
      ) : (
        <div className={styles.form}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.inputField}
          />
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
          <label>Number:</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className={styles.inputField}
          />
          <button onClick={handleSave} className={styles.saveButton}>
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
