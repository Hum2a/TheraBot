const { openai } = require('../config/openaiConfig');
const { db } = require('../config/firebaseConfig');
const { client } = require('../config/twilioConfig');
const admin = require('firebase-admin');

async function handleChat(req, res) {
  const { Body, From } = req.body;
  console.log("Webhook payload received:", req.body);

  try {
    const isWebUser = From === 'web-client';
    const userId = isWebUser ? 'web-user' : From; // User identifier
    const userRef = db.collection('users').doc(userId);

    // Check if the user exists in Firestore
    const userDoc = await userRef.get();
    if (!userDoc.exists && !isWebUser) {
      res.status(400).send('User not authenticated.');
      return;
    }

    // Generate session ID based on the current date-time
    const sessionId = new Date().toISOString();
    const conversationRef = userRef
      .collection('conversations')
      .doc(sessionId);

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
    res.status(500).json({ reply: 'Error processing your message.' });
  }
}

module.exports = { handleChat };
