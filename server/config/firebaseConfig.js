const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  try {
    // Method 1: Try environment variables (preferred for production/Render)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      
      console.log('Firebase Admin SDK initialized using environment variables');
    }
    // Method 2: Try service account file (for local development)
    else {
      const serviceAccountPath = path.join(__dirname, '..', 'therabot-7a708-firebase-adminsdk-fbsvc-2c710cf603.json');
      
      try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized using service account file');
      } catch (fileError) {
        throw new Error(
          'Firebase Admin SDK initialization failed. ' +
          'Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables, ' +
          'or provide the service account JSON file.'
        );
      }
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error.message);
    throw error;
  }
} else {
  console.log('Firebase Admin SDK already initialized');
}

// Get Firestore instance
const db = admin.firestore();

// Try to configure settings only if we just initialized (settings can only be called once)
// This is a best practice but not required - Firestore works without it
try {
  db.settings({ ignoreUndefinedProperties: true });
} catch (settingsError) {
  // Settings already configured or Firestore already in use - that's fine
  // This is expected if Firebase was initialized elsewhere
}

module.exports = { db };
