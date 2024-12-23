import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import styles from '../styles/ConversationHistory.module.css';

const ConversationHistory = () => {
  const [groupedConversations, setGroupedConversations] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
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

          groupConversationsByDay(fetchedConversations);
        }
      } catch (error) {
        console.error('Error fetching conversation history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const groupConversationsByDay = (conversations) => {
    const grouped = conversations.reduce((acc, conversation) => {
      const date = conversation.startedAt && conversation.startedAt.toDate
        ? new Date(conversation.startedAt.toDate()).toLocaleDateString()
        : 'Unknown Date';

      if (!acc[date]) acc[date] = [];
      acc[date].push(conversation);

      return acc;
    }, {});

    setGroupedConversations(grouped);

    // Initialize expanded state for all dates as collapsed
    setExpandedDays(Object.keys(grouped).reduce((acc, date) => ({ ...acc, [date]: false }), {}));
  };

  const toggleDayExpansion = (date) => {
    setExpandedDays((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId, date) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) return;

      const db = getFirestore();
      const conversationRef = doc(db, 'users', user.uid, 'conversations', conversationId);

      await deleteDoc(conversationRef);

      // Update the grouped conversations after deletion
      setGroupedConversations((prev) => {
        const updatedGrouped = { ...prev };
        updatedGrouped[date] = updatedGrouped[date].filter((c) => c.id !== conversationId);
        if (updatedGrouped[date].length === 0) delete updatedGrouped[date];
        return updatedGrouped;
      });

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
          {Object.keys(groupedConversations).length === 0 ? (
            <p>No previous conversations found.</p>
          ) : (
            Object.entries(groupedConversations).map(([date, conversations]) => (
              <div key={date} className={styles.dayGroup}>
                <h3 className={styles.dateHeader} onClick={() => toggleDayExpansion(date)}>
                  {date} {expandedDays[date] ? '▲' : '▼'}
                </h3>
                {expandedDays[date] && (
                  <div
                    className={`${styles.conversationsContainer} ${
                      expandedDays[date] ? styles.show : ''
                    }`}
                  >
                    {conversations.map((conversation) => (
                      <div key={conversation.id} className={styles.conversationItem}>
                        <h4 onClick={() => handleSelectConversation(conversation)}>
                          Session: {conversation.startedAt && conversation.startedAt.toDate
                            ? new Date(conversation.startedAt.toDate()).toLocaleString()
                            : 'Unknown Date'}
                        </h4>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDeleteConversation(conversation.id, date)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
