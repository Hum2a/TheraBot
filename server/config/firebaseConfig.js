const admin = require('firebase-admin');

console.log('=== Firebase Admin SDK Configuration ===');

// Render handles Firebase initialization via secret files
// Just get the existing Firestore instance - don't try to initialize or configure
if (admin.apps.length === 0) {
  console.warn('Firebase Admin SDK not initialized - Render should handle this via secret files');
  throw new Error('Firebase Admin SDK not initialized. Please ensure Firebase is configured in Render secrets.');
}

console.log('Firebase Admin SDK already initialized by Render');
// Get existing Firestore instance - don't call settings() as it's already configured
const db = admin.firestore();
console.log('Using existing Firestore instance');

module.exports = { db };
