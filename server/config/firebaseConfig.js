const admin = require('firebase-admin');
// const serviceAccount = require('/etc/secrets/therabot-fb6b3-firebase-adminsdk-tymrm-5be11a5729.json'); // Update path to Render's secrets directory
const path = require('path');

console.log('=== Firebase Admin SDK Initialization ===');
console.log('Current directory:', __dirname);
console.log('Service account path:', path.join(__dirname, '..', 'therabot-fb6b3-firebase-adminsdk-tymrm-5be11a5729.json'));

try {
  const serviceAccount = require(path.join(__dirname, '..', 'therabot-fb6b3-firebase-adminsdk-tymrm-5be11a5729.json'));
  console.log('Service account loaded successfully');
  console.log('Project ID:', serviceAccount.project_id);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Firebase Admin SDK initialized successfully');

  const db = admin.firestore();
  db.settings({ ignoreUndefinedProperties: true });
  console.log('Firestore initialized successfully');

  module.exports = { db };
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.error('Error stack:', error.stack);
  throw error;
}
