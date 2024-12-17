const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const otpRoutes = require('./routes/otpRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for Twilio
app.use(cors());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`, req.body);
  next();
});


// Routes
app.use('/auth', authRoutes);
app.use('/otp', otpRoutes);
app.use('/chat', chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
