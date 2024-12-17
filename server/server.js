const express = require('express');
const OpenAI = require('openai');
const twilio = require('twilio');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

// Firebase setup
const serviceAccount = require('./therabot-fb6b3-firebase-adminsdk-tymrm-5be11a5729.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint to verify phone numbers and generate SMS
app.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const session = await auth.createVerificationCode(phoneNumber);
    res.status(200).json({ session });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

// Endpoint to verify the OTP
app.post('/verify-otp', async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    const result = await auth.verifyCode(phoneNumber, code);
    res.status(200).json({ message: 'User verified successfully', user: result });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const { Body, From } = req.body;

  console.log(`Incoming message from ${From}: ${Body}`);

  // Ignore Twilio Sandbox Number
  if (From === whatsappNumber) {
    console.log("Ignoring messages from Twilio sandbox number.");
    return res.status(200).send('Ignored.');
  }

  try {
    // Send the user's message to OpenAI GPT-4 for a response
    const openAIResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: "You are a supportive and empathetic mental health assistant named TheraBot." },
        { role: 'user', content: Body },
      ],
    });

    const botReply = openAIResponse.choices[0].message.content;

    console.log(`GPT-4 Reply: ${botReply}`);

    // Save the conversation to Firebase Firestore
    await db.collection('conversations').add({
      user: From,
      userMessage: Body,
      botMessage: botReply,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('Conversation logged to Firestore.');

    // Send OpenAI's reply back to the user via Twilio WhatsApp
    await client.messages.create({
      from: whatsappNumber,
      to: From,
      body: botReply,
    });

    res.status(200).send('Reply sent successfully.');
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).send('Failed to process message.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
