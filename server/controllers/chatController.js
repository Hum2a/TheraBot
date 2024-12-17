const { openai } = require('../config/openaiConfig');
const { db } = require('../config/firebaseConfig');
const { client } = require('../config/twilioConfig');
const admin = require('firebase-admin');

/**
 * Initialize a new conversation session.
 * Generates a session ID and creates an empty session document in Firestore.
 */
async function initializeSession(req, res) {
  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) throw new Error('No token provided');

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

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

    res.status(200).json({ sessionId }); // Return the session ID
  } catch (error) {
    console.error('Error initializing session:', error);
    res.status(500).json({ error: 'Error initializing session' });
  }
}

/**
 * Handle incoming chat messages.
 * Saves messages in the session initialized earlier.
 */
async function handleChat(req, res) {
  const { Body, From, sessionId } = req.body;
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  console.log("Webhook payload received:", req.body);

  try {
    let userId = 'web-user'; // Default to 'web-user' for unauthenticated users

    // Verify Firebase ID token if present
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    } else if (From !== 'web-client') {
      userId = From; // Use From field for WhatsApp users
    }

    if (!sessionId) {
      throw new Error('No sessionId provided.');
    }

    // Reference to the user's session document
    const conversationRef = db
      .collection('users')
      .doc(userId)
      .collection('conversations')
      .doc(sessionId);

    const sessionDoc = await conversationRef.get();
    if (!sessionDoc.exists) {
      res.status(400).json({ error: 'Session does not exist.' });
      return;
    }

    // Generate a response using OpenAI
    const openAIResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a supportive and empathetic mental health assistant named TheraBot.
                    \nYou must act as a therapist to the user by looking past their question
                    \nand finding the root of their anxieties and problems.
                    \nUse all the resources on the internet to your advantage.` 
        },
        { 
          role: 'user', 
          content: Body 
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

    res.status(200).json({ reply: botReply }); // Return the bot's reply
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(500).json({ error: 'Error processing message.' });
  }
}

async function fetchHistory(req, res) {
    try {
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      if (!idToken) {
        return res.status(401).send('Unauthorized');
      }
  
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const userId = decodedToken.uid;
  
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
  
      res.status(200).json(conversations);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      res.status(500).send('Error fetching conversation history');
    }
  }
  
module.exports = { initializeSession, handleChat, fetchHistory };
  
