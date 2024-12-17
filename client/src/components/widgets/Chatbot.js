import React, { useState } from 'react';
import { sendMessageToChatbot } from '../../services/ChatService';
import styles from '../styles/ChatBot.module.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true); // Start loading

    try {
      const response = await sendMessageToChatbot(input);
      const botMessage = { sender: 'bot', text: response.reply || 'No response' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: 'Error processing your message.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false); // End loading
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
          placeholder="Type your message here..."
          className={styles.inputField}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
