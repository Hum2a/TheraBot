const admin = require('firebase-admin');
const path = require('path');

console.log('=== Firebase Admin SDK Initialization ===');

let initialized = false;

// Check if Firebase is already initialized (to avoid re-initialization)
if (admin.apps.length > 0) {
  console.log('Firebase Admin SDK already initialized');
  initialized = true;
} else {
  try {
    // Method 1: Try environment variables first (preferred for new setups)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Initializing Firebase Admin SDK using environment variables');
      
      // Decode the private key (it might be base64 encoded or have escaped newlines)
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      // Replace escaped newlines if present
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      console.log('Firebase Admin SDK initialized successfully using environment variables');
      console.log('Project ID:', serviceAccount.projectId);
      initialized = true;
    }
    // Method 2: Try service account file (fallback)
    else {
      // Try new service account file first, then fallback to old one
      const newServiceAccountPath = path.join(__dirname, '..', 'therabot-7a708-firebase-adminsdk-fbsvc-2c710cf603.json');
      const oldServiceAccountPath = path.join(__dirname, '..', 'therabot-fb6b3-firebase-adminsdk-tymrm-5be11a5729.json');
      
      let serviceAccountPath = null;
      try {
        require.resolve(newServiceAccountPath);
        serviceAccountPath = newServiceAccountPath;
        console.log('Found new service account file, attempting to load from:', serviceAccountPath);
      } catch (e) {
        try {
          require.resolve(oldServiceAccountPath);
          serviceAccountPath = oldServiceAccountPath;
          console.log('Found old service account file, attempting to load from:', serviceAccountPath);
        } catch (e2) {
          console.log('No service account file found');
        }
      }
      
      if (!serviceAccountPath) {
        throw new Error('No service account file found');
      }
      
      console.log('Attempting to load service account from:', serviceAccountPath);
      
      try {
        const serviceAccount = require(serviceAccountPath);
        console.log('Service account loaded successfully');
        console.log('Project ID:', serviceAccount.project_id);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully using service account file');
        initialized = true;
      } catch (fileError) {
        console.warn('Could not load service account file:', fileError.message);
        throw new Error('Firebase Admin SDK initialization failed: No service account file or environment variables found. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables, or provide a service account JSON file.');
      }
    }

    // Initialize Firestore
    const db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    console.log('Firestore initialized successfully');
    initialized = true;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.error('Error stack:', error.stack);
    console.error('\n=== Firebase Configuration Help ===');
    console.error('Please set the following environment variables:');
    console.error('  - FIREBASE_PROJECT_ID');
    console.error('  - FIREBASE_PRIVATE_KEY (the private_key from your service account JSON)');
    console.error('  - FIREBASE_CLIENT_EMAIL');
    console.error('\nOr provide a service account JSON file in the server root directory.');
    throw error;
  }
}

// Export db - ensure it's always available
if (!initialized || admin.apps.length === 0) {
  throw new Error('Firebase Admin SDK was not initialized. Check server logs for details.');
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
module.exports = { db };
