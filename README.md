# TheraBot

TheraBot is a therapeutic chatbot application built with React and Node.js that provides users with mental health support through AI-powered conversations.

## Features

- User authentication with Firebase
- OTP verification via Twilio
- Therapeutic chat sessions with OpenAI integration
- Personalized user profiles
- Conversation history tracking
- Responsive design for mobile and desktop
- SEO optimized for better discoverability

## Project Structure

The project is divided into two main parts:

- **Client**: React frontend application
- **Server**: Node.js/Express backend API

### Tech Stack

#### Frontend
- React
- React Router
- Firebase Authentication
- Axios for API calls

#### Backend
- Node.js
- Express
- Firebase Admin SDK
- Twilio for OTP verification
- OpenAI API for chat functionality
- Google APIs

## Getting Started

### Prerequisites
- Node.js and npm installed
- Firebase account
- Twilio account
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/TheraBot.git
cd TheraBot
```

2. Install dependencies for the root project, client, and server
```bash
npm install
cd client && npm install
cd ../server && npm install
```

3. Set up environment variables:
   - Create `.env` file in the server directory with:
   ```
   PORT=3001
   OPENAI_API_KEY=your_openai_api_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```
   
   - Create `.env` file in the client directory with:
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
   REACT_APP_API_URL=http://localhost:3001
   ```

4. Set up Firebase:
   - Place your Firebase service account key JSON file in the server directory
   - Update the path in the server's Firebase configuration

### Running the Application

1. Start the backend server
```bash
cd server
node server.js
```

2. Start the frontend client (in a new terminal)
```bash
cd client
npm start
```

3. Access the application at http://localhost:3000

## Usage

1. Create an account or log in using the provided authentication methods
2. Complete your profile with relevant personal information
3. Start a new chat session with TheraBot to receive therapeutic support
4. Access your conversation history from the dashboard
5. Update personal preferences in the settings page

## SEO Optimization

TheraBot includes several SEO optimizations:

1. **Meta Tags**: Enhanced metadata in the HTML head for better search engine visibility
2. **Open Graph Protocol**: Social media sharing optimizations for Facebook, Twitter, and other platforms
3. **Structured Data**: Schema.org JSON-LD markup for search engine understanding
4. **Sitemap**: XML sitemap for better search engine crawling
5. **Robots.txt**: Proper configuration for search engine crawlers
6. **Security.txt**: Standard file for security researchers
7. **Web Manifest**: PWA support with proper metadata
8. **Canonical URLs**: Prevention of duplicate content issues

## License

[MIT](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request 