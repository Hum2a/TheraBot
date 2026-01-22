const admin = require('firebase-admin');
const path = require('path');

console.log('=== Firebase Admin SDK Initialization ===');

let db = null;

// Check if Firebase is already initialized (to avoid re-initialization)
if (admin.apps.length > 0) {
  console.log('Firebase Admin SDK already initialized');
  // Get existing Firestore instance without calling settings() again
  db = admin.firestore();
  console.log('Using existing Firestore instance');
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
    }
    // Method 2: Try new service account file
    else {
      const serviceAccountPath = path.join(__dirname, '..', 'therabot-7a708-firebase-adminsdk-fbsvc-2c710cf603.json');
      console.log('Attempting to load service account from:', serviceAccountPath);
      
      try {
        const serviceAccount = require(serviceAccountPath);
        console.log('Service account loaded successfully');
        console.log('Project ID:', serviceAccount.project_id);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully using service account file');
      } catch (fileError) {
        console.error('Could not load service account file:', fileError.message);
        throw new Error('Firebase Admin SDK initialization failed: No service account file or environment variables found. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL environment variables, or provide the service account JSON file.');
      }
    }

    // Initialize Firestore
    // Get the Firestore instance first
    db = admin.firestore();
    
    // Try to configure settings, but don't fail if it's already been initialized
    // settings() can only be called once, and only before any other Firestore operations
    try {
      db.settings({ ignoreUndefinedProperties: true });
      console.log('Firestore settings configured successfully');
    } catch (settingsError) {
      // If settings() has already been called, that's okay - just use the existing instance
      if (settingsError.message && settingsError.message.includes('already been initialized')) {
        console.log('Firestore already initialized elsewhere, using existing instance without settings()');
        // db is already set, so we can continue
      } else {
        // For other errors, log but don't fail - settings() is optional
        console.warn('Could not configure Firestore settings:', settingsError.message);
        console.warn('Continuing without custom settings...');
      }
    }
    console.log('Firestore instance ready');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    console.error('Error stack:', error.stack);
    console.error('\n=== Firebase Configuration Help ===');
    console.error('Please set the following environment variables:');
    console.error('  - FIREBASE_PROJECT_ID');
    console.error('  - FIREBASE_PRIVATE_KEY (the private_key from your service account JSON)');
    console.error('  - FIREBASE_CLIENT_EMAIL');
    console.error('\nOr provide the service account JSON file: therabot-7a708-firebase-adminsdk-fbsvc-2c710cf603.json');
    throw error;
  }
}

// Export db - use the existing instance, don't create a new one
if (!db) {
  throw new Error('Firebase Admin SDK was not initialized. Check server logs for details.');
}

module.exports = { db };
