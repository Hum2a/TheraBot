const { google } = require('googleapis');
const { db } = require('../config/firebaseConfig');
const admin = require('firebase-admin');
const libphonenumber = require('google-libphonenumber');
const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

function generateGoogleAuthLink(phoneNumber) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
    state: phoneNumber, // Ensure phone number is passed in E.164 format
  });
}

async function googleAuthCallback(req, res) {
  const code = req.query.code;
  const userPhoneNumber = req.query.state;

  if (!userPhoneNumber) {
    console.error('Phone number is missing in state.');
    return res.status(400).send('Invalid request. Phone number is missing.');
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email;

    // Clean and format the phone number
    const formattedPhoneNumber = formatPhoneNumber(userPhoneNumber);

    // Check if the user already exists in Firebase Authentication
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(googleEmail);
      console.log('User already exists, signing in:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User does not exist, create a new user
        console.log('User not found, creating a new user...');
        userRecord = await admin.auth().createUser({
          email: googleEmail,
          phoneNumber: formattedPhoneNumber,
          emailVerified: true,
        });
        console.log('User created successfully:', userRecord.uid);
      } else {
        throw error; // Re-throw unexpected errors
      }
    }

    const userUID = userRecord.uid;

    // Save the WhatsApp number in `registered_numbers`
    await db.collection('registered_numbers').doc(formattedPhoneNumber).set({
      uid: userUID,
      phoneNumber: formattedPhoneNumber,
    });

    // Save user data in `users/{uid}`
    await db.collection('users').doc(userUID).set(
      {
        eail: googleEmail,
        phoneNumber: formattedPhoneNumber,
        isAuthenticated: true,
        authMethod: 'google',
      },
      { merge: true } // Merge to prevent overwriting existing data
    );

    // Generate a custom token for client sign-in
    const { customToken } = await registerNewUser(googleEmail);

    res.json({
      message: 'Authentication successful! You can now continue chatting with TheraBot.',
      customToken: customToken,
    });
  } catch (error) {
    console.error('Error during Google OAuth:', error);
    res.status(500).send('Authentication failed.');
  }
}

async function registerNewUser(email) {
  try {
    // Generate a custom token for the user using the email
    const customToken = await admin.auth().createCustomToken(email);

    console.log('Custom token generated successfully:', customToken);
    return { customToken };
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

// async function registerNewUser(email, phoneNumber) {
//   try {
//     // Validate the phone number
//     const userRecord = await admin.auth().createUser({
//       email: email,
//       phoneNumber: phoneNumber,
//       emailVerified: true,
//       disabled: false,
//     });

//     console.log('User registered successfully:', userRecord.uid);
//     return userRecord;
//   } catch (error) {
//     console.error('Error creating new user:', error);
//     throw error;
//   }
// }

function formatPhoneNumber(phoneNumber) {
  try {
    // Remove 'whatsapp:' prefix and unwanted characters
    const cleanNumber = phoneNumber.replace(/^whatsapp:/, '').replace(/[^\d+]/g, '');
    console.log('Cleaned Phone Number:', cleanNumber);

    // Parse the number (no default region, since E.164 includes the country code)
    const parsedNumber = phoneUtil.parse(cleanNumber); // No region needed for E.164

    // Validate the parsed phone number
    if (!phoneUtil.isValidNumber(parsedNumber)) {
      throw new Error('Invalid phone number');
    }

    // Format the number to E.164
    return phoneUtil.format(parsedNumber, libphonenumber.PhoneNumberFormat.E164);
  } catch (error) {
    console.error('Error formatting phone number:', error.message);
    throw new Error('Invalid phone number format');
  }
}

module.exports = { generateGoogleAuthLink, googleAuthCallback };
