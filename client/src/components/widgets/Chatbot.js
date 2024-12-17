import React, { useState, useEffect } from 'react';
import { sendMessageToChatbot, initializeSession } from '../../services/ChatService';
import styles from '../styles/ChatBot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Initialize session when the component loads
  useEffect(() => {
    const createSession = async () => {
      try {
        const newSessionId = await initializeSession();
        setSessionId(newSessionId);
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };
    createSession();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessageToChatbot(input, sessionId);
      const botMessage = { sender: 'bot', text: response.reply || 'No response' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'Error processing your message.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handle the Enter key event
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault(); // Prevent default form submission behavior
      sendMessage();
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>Welcome to TheraBot</div>

      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
            <div className={styles.messageText}>
              <strong>{msg.sender === 'user' ? 'You' : 'TheraBot'}:</strong> {msg.text}
            </div>
          </div>
        ))}
        {loading && <div className={styles.loading}>TheraBot is thinking...</div>}
      </div>

      <div className={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // Listen for Enter key
          placeholder="Type your message here..."
          className={styles.inputField}
        />
        <button onClick={sendMessage} className={styles.sendButton} disabled={!input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
