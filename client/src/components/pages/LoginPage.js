import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../../firebase/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import styles from '../styles/LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Save user profile to Firestore
  const saveUserProfile = async (user) => {
    console.log('Current User:', auth.currentUser);
    try {
      const userRef = doc(db, `users/${user.uid}`);
      const profileData = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email,
      };
      await setDoc(userRef, profileData, { merge: true });
      console.log('User profile saved:', profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user data to Firestore
      await saveUserProfile(user);

      alert(`Welcome, ${user.displayName}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Login Failed:', error);
      alert('Google login failed. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2>Login to TheraBot</h2>
        <form>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
          />
          <button type="button" className={styles.loginButton}>
            Login
          </button>
        </form>
        <div className={styles.divider}>OR</div>
        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
