import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = process.env.API_URL;

export const sendMessageToChatbot = async (userMessage) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated.');

  const idToken = await user.getIdToken(); // Get the Firebase ID token

  try {
    const response = await axios.post(
      `${API_URL}/chat/webhook`,
      { Body: userMessage, From: 'web-client' }, // Request body
      { headers: { Authorization: `Bearer ${idToken}` } } // Send token in headers
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
