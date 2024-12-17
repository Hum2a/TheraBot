const { google } = require('googleapis');

// Function to generate Google Auth URL
function generateGoogleAuthLink() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, // Your Google Client ID
    process.env.GOOGLE_CLIENT_SECRET, // Your Google Client Secret
    process.env.REDIRECT_URI // Your Redirect URI after successful login
  );

  // Define the scopes for Google Authentication
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });

  return authUrl;
}
