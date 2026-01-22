const { openai } = require('../config/openaiConfig');
const { db } = require('../config/firebaseConfig');
const { client } = require('../config/twilioConfig');
const admin = require('firebase-admin');
const { generateGoogleAuthLink } = require('./authController');

/**
 * Initialize a new conversation session.
 * Generates a session ID and creates an empty session document in Firestore.
 */
async function initializeSession(userId) {
  try {
    // Generate a session ID (ISO date-time)
    const sessionId = new Date().toISOString();
    const conversationRef = db
      .collection('users')
      .doc(userId)
      .collection('conversations')
      .doc(sessionId);

    // Initialize the session document
    await conversationRef.set({
      startedAt: new Date(),
      messages: [],
    });

    return sessionId;
  } catch (error) {
    console.error('Error initializing session:', error);
    throw error;
  }
}

/**
 * Handle incoming chat messages.
 * Saves messages in the session initialized earlier.
 * 
 */
async function handleChat(Body, From, sessionId, userId) {
  try {
    // Fetch user preferences
    console.log(`Fetching preferences for userId: ${userId}`);
    const preferencesRef = db.collection('users').doc(userId).collection('settings').doc('preferences');
    const preferencesDoc = await preferencesRef.get();

    let tone = 'empathetic';
    let nickname = 'User';
    let role = 'therapist';

    if (preferencesDoc.exists) {
      const preferences = preferencesDoc.data();
      const personalization = preferences.personalization || {};
      tone = personalization.tone || tone;
      nickname = personalization.nickname || nickname;
      role = personalization.role || role;
      console.log(`Fetched preferences:\n Tone: ${tone}\n Role: ${role}\n Nickname: ${nickname}`);
    } else {
      console.log('Preferences document does not exist. Using default values.');
    }

    // Check for sessionId or generate one if missing
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = new Date().toISOString();
      console.log(`Generated sessionId: ${activeSessionId}`);
    }

    // Reference to the user's session document
    const conversationRef = db
      .collection('users')
      .doc(userId)
      .collection('conversations')
      .doc(activeSessionId);

    const botSettings = {
      tone: tone || 'empathetic',
      nickname: nickname || 'User',
      role: role || 'therapist',
    };

    // Check if session exists, initialize if it doesn't
    const sessionDoc = await conversationRef.get();
    if (!sessionDoc.exists) {
      await conversationRef.set({
        startedAt: new Date(),
        messages: [],
        botSettings,
      });
    }

    // Command Handling
    const lowerBody = Body.trim().toLowerCase();
    if (lowerBody === "end conversation") {
      await conversationRef.update({
        endedAt: new Date(),
      });
      const endMessage = "Your conversation has been ended. You can start a new one anytime by sending a message.";
      return { reply: endMessage };
    } else if (lowerBody === "menu") {
      const menuMessage = "TheraBot Commands:\n- Type 'website' to recieve a link to the website. \n- Type 'end conversation' to end the current session.\n- Type 'menu' to view this message again.\n- Type 'profile' to view Profile.\n- Type 'settings' to view Settings.";
      return { reply: menuMessage };
    } else if (lowerBody === "profile") {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        const profileMessage = `Your Profile:\n- Name: ${userData.name || 'N/A'}\n- Email: ${userData.email || 'N/A'}\n- Phone: ${userData.phoneNumber || 'N/A'}`;
        return { reply: profileMessage };
      } else {
        const errorMessage = 'Profile not found.';
        return { reply: errorMessage };
      }
    } else if (lowerBody === "settings") {
      const settingsRef = db.collection('users').doc(userId).collection('settings').doc('preferences');
      const settingsDoc = await settingsRef.get();
      if (settingsDoc.exists) {
        const settingsData = settingsDoc.data();
        const settingsPersonalization = settingsData.personalization || {};
        const settingsMessage = `Your Settings:\n- Tone: ${settingsPersonalization.tone || 'Default'}\n- Role: ${settingsPersonalization.role || 'Default'}\n- Nickname: ${settingsPersonalization.nickname || 'Default'}`;
        return { reply: settingsMessage };
      } else {
        const errorMessage = 'Settings not found.';
        return { reply: errorMessage };
      }
    } else if (lowerBody === "website") {
      const websiteMessage = "Visit the TheraBot website at: https://therabot-site.onrender.com";
      return { reply: websiteMessage };
    }

    // Generate a response using OpenAI
    const systemPrompt = `You are a ${tone || 'supportive'} assistant named TheraBot, acting as a ${role || 'therapist'}.
    Address the user as \"${nickname || 'User'}\" and maintain a ${tone || 'empathetic'} tone throughout the conversation.
    
    Your primary goal is to facilitate meaningful personal growth and self-discovery through conversation. Follow these guidelines:
    
    1. Active Listening & Reflection:
    - Listen carefully to the user's concerns and emotions
    - Reflect back their feelings and thoughts to show understanding
    - Ask thoughtful follow-up questions to deepen the conversation
    
    2. Growth-Oriented Approach:
    - Help users identify patterns in their thoughts and behaviors
    - Encourage self-reflection and self-awareness
    - Guide users to discover their own insights rather than giving direct advice
    - Celebrate progress and acknowledge challenges
    
    3. Therapeutic Techniques:
    - Use open-ended questions to explore topics more deeply
    - Validate emotions while gently challenging unhelpful thought patterns
    - Help users develop coping strategies and practical solutions
    - Maintain appropriate boundaries and professional distance
    
    4. Conversation Flow:
    - Keep responses concise but meaningful
    - Balance empathy with constructive feedback
    - Create a safe space for honest expression
    - Focus on the present while acknowledging past experiences
    
    Remember: Your role is to guide users toward their own insights and growth, not to provide direct solutions or medical advice.`;

    const openAIResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: Body,
        },
      ],
    });

    const botReply = openAIResponse.choices[0].message.content;

    // Append the new message to the session document in Firestore
    await conversationRef.update({
      messages: admin.firestore.FieldValue.arrayUnion({
        userMessage: Body,
        botMessage: botReply,
        timestamp: new Date(),
      }),
    });

    return { reply: botReply };
  } catch (error) {
    console.error('Error handling chat:', error);
    return { error: 'Error processing your message.' };
  }
}

/**
 * Fetch conversation history for a user.
 * Returns all conversations for the given userId.
 */
async function fetchHistory(userId) {
  try {
    // Fetch conversations for the user
    const conversationsRef = db
      .collection('users')
      .doc(userId)
      .collection('conversations');

    const snapshot = await conversationsRef.get();

    const conversations = [];
    snapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() });
    });

    return conversations;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw error;
  }
}

/**
 * Delete a conversation session.
 * Verifies the session belongs to the user before deleting.
 */
async function deleteSession(sessionId, userId) {
  try {
    const conversationRef = db
      .collection('users')
      .doc(userId)
      .collection('conversations')
      .doc(sessionId);

    // Verify the session exists and belongs to the user
    const sessionDoc = await conversationRef.get();
    if (!sessionDoc.exists) {
      throw new Error('Session not found');
    }

    // Delete the session
    await conversationRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

module.exports = { initializeSession, handleChat, fetchHistory, deleteSession };
  
