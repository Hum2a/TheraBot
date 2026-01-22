const OpenAI = require('openai');

// Verify API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
  console.error('Please set OPENAI_API_KEY in your environment variables.');
}

// Log API key info (first 7 and last 4 chars for debugging, without exposing the full key)
const apiKey = process.env.OPENAI_API_KEY;
if (apiKey) {
  const maskedKey = apiKey.length > 11 
    ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
    : '***';
  console.log('OpenAI API Key configured:', maskedKey);
  console.log('API Key starts with:', apiKey.substring(0, 3)); // Should be 'sk-'
} else {
  console.error('OpenAI API Key is missing!');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = { openai };
