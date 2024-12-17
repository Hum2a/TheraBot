const { openai } = require('../config/openaiConfig');
const { db } = require('../config/firebaseConfig');
const { client } = require('../config/twilioConfig');
const admin = require('firebase-admin');

async function handleChat(req, res) {
  const { Body, From } = req.body;
  const idToken = req.headers.authorization?.split('Bearer ')[1]; // Extract token
  console.log("Webhook payload received:", req.body);

  try {
    let userId = 'web-user'; // Default for unauthenticated web users

    // Verify the Firebase ID token
    if (idToken) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid; // Firebase UID of the authenticated user
    } else if (From !== 'web-client') {
      userId = From; // Use the "From" field for WhatsApp users
    }

    const userRef = db.collection('users').doc(userId);

    // Check if the user exists in Firestore
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({ createdAt: new Date() }); // Create user if not exists
    }

    // Generate session ID based on the current date-time
    const sessionId = new Date().toISOString();
    const conversationRef = userRef.collection('conversations').doc(sessionId);

    // Initialize session if it doesn't exist
    const sessionDoc = await conversationRef.get();
    if (!sessionDoc.exists) {
      await conversationRef.set({
        startedAt: new Date(),
        messages: [],
      });
    }

    // Generate a response using OpenAI
    const openAIResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: "You are a supportive and empathetic mental health assistant named TheraBot." },
        { role: 'user', content: Body },
      ],
    });

    const botReply = openAIResponse.choices[0].message.content;

    // Append the new message to the session in Firestore
    await conversationRef.update({
      messages: admin.firestore.FieldValue.arrayUnion({
        userMessage: Body,
        botMessage: botReply,
        timestamp: new Date(),
      }),
    });
        // Send the reply only to WhatsApp users
        if (!isWebUser) {
            await client.messages.create({
              from: process.env.TWILIO_WHATSAPP_NUMBER,
              to: From,
              body: botReply,
            });
          }

    res.status(200).json({ reply: botReply }); // Send response back to the web client
  } catch (error) {
    console.error('Error handling chat:', error);
    res.status(401).json({ reply: 'User not authenticated or error occurred.' });
  }
}

module.exports = { handleChat };
