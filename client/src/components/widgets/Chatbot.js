import React, { useState, useEffect } from 'react';
import { sendMessageToChatbot, initializeSession } from '../../services/ChatService';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import styles from '../styles/ChatBot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Check authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Initialize session when authenticated
  useEffect(() => {
    const createSession = async () => {
      if (!isAuthenticated) {
        setSessionId(null);
        setConnectionError(null);
        return;
      }
      
      setIsConnecting(true);
      setConnectionError(null);
      
      try {
        const newSessionId = await initializeSession();
        setSessionId(newSessionId);
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setConnectionError(error.message || 'Failed to connect to chatbot');
        setSessionId(null);
      } finally {
        setIsConnecting(false);
      }
    };
    createSession();
  }, [isAuthenticated]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !isAuthenticated) return;

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

  if (!isAuthenticated) {
    return (
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>Welcome to TheraBot</div>
        <div className={styles.messagesContainer}>
          <div className={`${styles.message} ${styles.bot}`}>
            <div className={styles.messageText}>
              Please log in to start chatting with TheraBot.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>Welcome to TheraBot</div>

      <div className={styles.messagesContainer}>
        {!sessionId && isConnecting && (
          <div className={`${styles.message} ${styles.bot}`}>
            <div className={styles.messageText}>
              Connecting to TheraBot...
            </div>
          </div>
        )}
        {!sessionId && !isConnecting && connectionError && (
          <div className={`${styles.message} ${styles.bot}`}>
            <div className={styles.messageText} style={{ color: '#d32f2f' }}>
              <strong>Connection Error:</strong> {connectionError}
              <br />
              <small>Visit the Developer page to diagnose the issue.</small>
            </div>
          </div>
        )}
        {sessionId && messages.length === 0 && (
          <div className={`${styles.message} ${styles.bot}`}>
            <div className={styles.messageText}>
              Connected! You can start chatting with TheraBot.
            </div>
          </div>
        )}
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
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className={styles.inputField}
        />
        <button 
          onClick={sendMessage} 
          className={styles.sendButton} 
          disabled={!input.trim() || !sessionId || isConnecting}
          title={!sessionId ? 'Not connected to chatbot' : ''}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
