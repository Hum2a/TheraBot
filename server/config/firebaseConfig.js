const admin = require('firebase-admin');
const serviceAccount = require('/etc/secrets/therabot-firebase-key.json'); // Update path to Render's secrets directory

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // Add this line

module.exports = { db };
