import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_URL = 'https://2377-92-40-174-2.ngrok-free.app';
// const API_URL = "https://therabot-9v4b.onrender.com";
// const API_URL = process.env.API_URL;
// Use local server for development

export const initializeSession = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('No authenticated user found');
    throw new Error('User not authenticated.');
  }

  console.log('Getting ID token for user:', user.uid);
  const idToken = await user.getIdToken();
  console.log('Got ID token, length:', idToken.length);

  try {
    console.log('Sending request to initialize session');
    const response = await axios.post(
      `${API_URL}/chat/initialize-session`,
      {},
      { 
        headers: { 
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    console.log('Session initialized successfully:', response.data);
    return response.data.sessionId;
  } catch (error) {
    console.error('Error initializing session:', error.response?.data || error.message);
    throw error;
  }
};

export const sendMessageToChatbot = async (userMessage, sessionId) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated.');

  const idToken = await user.getIdToken();

  try {
    const response = await axios.post(
      `${API_URL}/chat/webhook`,
      { Body: userMessage, From: 'web-client', sessionId },
      { 
        headers: { 
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const fetchConversationHistory = async (user) => {
  const idToken = await user.getIdToken();

  try {
    const response = await axios.get(`${API_URL}/chat/history`, {
      headers: { 
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};
