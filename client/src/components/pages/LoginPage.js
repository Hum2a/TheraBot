import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../../firebase/firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import styles from '../styles/LoginPage.module.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Save user profile to Firestore
  const saveUserProfile = async (user, displayName = '') => {
    try {
      const userRef = doc(db, `users/${user.uid}`);
      const profileData = {
        uid: user.uid,
        name: displayName || user.displayName || '',
        email: user.email,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, profileData, { merge: true });
      console.log('User profile saved:', profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await saveUserProfile(user);
      alert(`Welcome, ${user.displayName}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Login Failed:', error);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserProfile(result.user);
        navigate('/dashboard');
      } else {
        // Register
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserProfile(result.user, name);
        alert(`Welcome, ${name}!`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication Failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h2>{isLogin ? 'Login to TheraBot' : 'Create Account'}</h2>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleEmailAuth}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.inputField}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.inputField}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
            required
          />
          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        <div className={styles.divider}>OR</div>
        <button 
          onClick={handleGoogleLogin} 
          className={styles.googleButton}
          disabled={loading}
        >
          Continue with Google
        </button>
        <div className={styles.switchMode}>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className={styles.switchButton}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
