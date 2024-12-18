const admin = require('firebase-admin');
const serviceAccount = require('../therabot-fb6b3-firebase-adminsdk-tymrm-5be11a5729.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true }); // Add this line

module.exports = { db };
