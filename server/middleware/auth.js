const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    console.log('=== Auth Middleware Debug ===');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request method:', req.method);
    console.log('Request URL:', req.originalUrl);
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header found');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token received, length:', token.length);
    console.log('Token first 10 chars:', token.substring(0, 10) + '...');
    
    try {
      console.log('Attempting to verify token...');
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Token verified successfully:', {
        uid: decodedToken.uid,
        email: decodedToken.email,
        exp: decodedToken.exp,
        iat: decodedToken.iat
      });
      
      // Add user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email
      };
      
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      console.error('Error code:', verifyError.code);
      console.error('Error message:', verifyError.message);
      console.error('Error stack:', verifyError.stack);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    console.error('Error stack:', error.stack);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  verifyFirebaseToken
}; 