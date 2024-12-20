import axios from 'axios';
import { getAuth } from 'firebase/auth';

// const API_URL = 'https://ea05-82-38-34-108.ngrok-free.app';
const API_URL = "https://therabot-9v4b.onrender.com";
// const API_URL = process.env.API_URL;

export const initializeSession = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error('User not authenticated.');

  const idToken = await user.getIdToken();

  try {
    const response = await axios.post(
      `${API_URL}/chat/initialize-session`,
      {},
      { headers: { Authorization: `Bearer ${idToken}` } }
    );
    return response.data.sessionId; // Return the sessionId
  } catch (error) {
    console.error('Error initializing session:', error);
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
      { headers: { Authorization: `Bearer ${idToken}` } }
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
      headers: { Authorization: `Bearer ${idToken}` },
    });

    return response.data; // Return conversation history
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
};
