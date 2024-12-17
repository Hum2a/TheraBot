import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import styles from '../styles/ConversationHistory.module.css';

const ConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const db = getFirestore();
          const conversationsRef = collection(
            doc(db, 'users', user.uid),
            'conversations'
          );

          const snapshot = await getDocs(conversationsRef);

          const fetchedConversations = [];
          snapshot.forEach((doc) => {
            fetchedConversations.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          setConversations(fetchedConversations);
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const db = getFirestore();
      const conversationRef = doc(db, 'users', user.uid, 'conversations', conversationId);

      await deleteDoc(conversationRef); // Delete the document from Firestore

      // Update the state to remove the deleted conversation
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setSelectedConversation(null);

      console.log('Conversation deleted successfully.');
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Conversation History</h2>
      {loading ? (
        <p>Loading conversations...</p>
      ) : (
        <div className={styles.conversationList}>
          {conversations.length === 0 ? (
            <p>No previous conversations found.</p>
          ) : (
            conversations.map((conversation) => (
              <div key={conversation.id} className={styles.conversationItem}>
                <h3 onClick={() => handleSelectConversation(conversation)}>
                  Session: {conversation.startedAt && conversation.startedAt.toDate
                    ? new Date(conversation.startedAt.toDate()).toLocaleString()
                    : 'Unknown Date'}
                </h3>
                {/* Delete Button */}
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteConversation(conversation.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedConversation && (
        <div className={styles.messagesContainer}>
          <h3>Messages</h3>
          <ul className={styles.messageList}>
            {selectedConversation.messages.map((msg, index) => (
              <div key={index} className={styles.messageContainer}>
                {/* User Message */}
                <li className={styles.userMessage}>
                  <strong>
                    You (
                    {msg.timestamp && msg.timestamp.toDate
                      ? new Date(msg.timestamp.toDate()).toLocaleString()
                      : 'Unknown Date'}
                    ):
                  </strong>
                  <p>{msg.userMessage}</p>
                </li>
                {/* Bot Message */}
                <li className={styles.botMessage}>
                  <strong>
                    TheraBot (
                    {msg.timestamp && msg.timestamp.toDate
                      ? new Date(msg.timestamp.toDate()).toLocaleString()
                      : 'Unknown Date'}
                    ):
                  </strong>
                  <p>{msg.botMessage}</p>
                </li>
              </div>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
