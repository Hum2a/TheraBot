# TheraBot 🤖💭

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/react-%5E18.0.0-blue)](https://reactjs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> An AI-powered therapeutic chatbot providing mental health support through personalized conversations.

![TheraBot Demo](docs/images/demo.gif)

## 🌟 Features

- 🔒 Secure user authentication with Firebase
- 📱 OTP verification via Twilio
- 🤖 AI-powered therapeutic conversations using OpenAI
- 👤 Personalized user profiles
- 📝 Conversation history tracking
- 🎨 Beautiful, responsive design
- 🔐 Enterprise-grade security measures

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Firebase account
- Twilio account
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/TheraBot.git
cd TheraBot
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. Set up environment variables
```bash
# Client
cp client/.env.example client/.env

# Server
cp server/.env.example server/.env
```

4. Configure your environment variables with your API keys and credentials

### Running the Application

1. Start the server
```bash
cd server
npm run dev
```

2. Start the client (in a new terminal)
```bash
cd client
npm start
```

3. Visit http://localhost:3000 in your browser

## 🏗️ Architecture

```
TheraBot/
├── client/                 # React frontend
│   ├── public/            # Static files
│   └── src/              
│       ├── components/    # React components
│       ├── contexts/      # React contexts
│       ├── services/      # API services
│       └── utils/         # Utility functions
├── server/                # Node.js backend
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   └── services/        # Business logic
└── docs/                 # Documentation
```

## 🔒 Security Features

- CORS protection
- Rate limiting
- Input validation
- XSS prevention
- Session management
- Request sanitization
- Secure headers
- Audit logging

## 📚 API Documentation

Detailed API documentation is available at [/docs/api.md](docs/api.md)

## 🧪 Testing

```bash
# Run client tests
cd client && npm test

# Run server tests
cd server && npm test

# Run e2e tests
npm run test:e2e
```

## 📈 Performance

- Optimized bundle size
- Lazy loading components
- Efficient caching
- Response compression
- Image optimization
- PWA support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their powerful API
- Firebase for authentication
- Twilio for OTP services
- All our contributors and supporters

## 📞 Support

- Documentation: [/docs](docs/README.md)
- Issues: [GitHub Issues](https://github.com/yourusername/TheraBot/issues)
- Email: support@therabot.com
- Discord: [Join our community](https://discord.gg/therabot)

## 🔮 Roadmap

See our [ROADMAP.md](ROADMAP.md) for planned features and improvements.

---

Made with ❤️ by [Your Name] 