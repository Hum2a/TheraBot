import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { initializeSession, sendMessageToChatbot } from '../../services/ChatService';
import axios from 'axios';
import styles from '../styles/DeveloperPage.module.css';

const API_URL = 'https://therabot-9v4b.onrender.com';

const DeveloperPage = () => {
  const [testResults, setTestResults] = useState({
    authentication: { status: 'pending', message: 'Not tested', details: null },
    idToken: { status: 'pending', message: 'Not tested', details: null },
    apiConnection: { status: 'pending', message: 'Not tested', details: null },
    sessionInit: { status: 'pending', message: 'Not tested', details: null },
    messageSend: { status: 'pending', message: 'Not tested', details: null }
  });

  const [sessionId, setSessionId] = useState(null);
  const [testMessage, setTestMessage] = useState('Hello, this is a test message');
  const [isRunningAll, setIsRunningAll] = useState(false);

  // Monitor authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setTestResults(prev => ({
          ...prev,
          authentication: {
            status: 'success',
            message: `Authenticated as ${user.email}`,
            details: { uid: user.uid, email: user.email }
          }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          authentication: {
            status: 'error',
            message: 'Not authenticated',
            details: null
          }
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const testAuthentication = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      setTestResults(prev => ({
        ...prev,
        authentication: {
          status: 'success',
          message: `Authenticated as ${user.email}`,
          details: { uid: user.uid, email: user.email, displayName: user.displayName }
        }
      }));
    } else {
      setTestResults(prev => ({
        ...prev,
        authentication: {
          status: 'error',
          message: 'No authenticated user found',
          details: null
        }
      }));
    }
  };

  const testIdToken = async () => {
    setTestResults(prev => ({
      ...prev,
      idToken: { status: 'testing', message: 'Testing ID token retrieval...', details: null }
    }));

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const idToken = await user.getIdToken();
      const decodedToken = parseJwt(idToken);
      
      setTestResults(prev => ({
        ...prev,
        idToken: {
          status: 'success',
          message: 'ID token retrieved successfully',
          details: {
            tokenLength: idToken.length,
            expiresAt: new Date(decodedToken.exp * 1000).toLocaleString(),
            issuedAt: new Date(decodedToken.iat * 1000).toLocaleString(),
            userId: decodedToken.user_id
          }
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        idToken: {
          status: 'error',
          message: `Failed to get ID token: ${error.message}`,
          details: { error: error.toString() }
        }
      }));
    }
  };

  const testApiConnection = async () => {
    setTestResults(prev => ({
      ...prev,
      apiConnection: { status: 'testing', message: 'Testing API connection...', details: null }
    }));

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const idToken = await user.getIdToken();
      
      // Try to reach the API endpoint
      const response = await axios.get(`${API_URL}/health`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: () => true // Accept any status code
      });

      if (response.status === 200 || response.status === 404) {
        // 404 is okay, it means the server is reachable
        setTestResults(prev => ({
          ...prev,
          apiConnection: {
            status: 'success',
            message: `API server is reachable (Status: ${response.status})`,
            details: {
              url: API_URL,
              status: response.status,
              responseTime: response.headers['x-response-time'] || 'N/A'
            }
          }
        }));
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = 'Failed to connect to API';
      let errorDetails = {};

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'API connection timeout';
        errorDetails = { timeout: 'Request took longer than 5 seconds' };
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - API server may be down';
        errorDetails = { networkError: error.message };
      } else if (error.response) {
        errorMessage = `API returned error: ${error.response.status}`;
        errorDetails = { status: error.response.status, data: error.response.data };
      } else {
        errorDetails = { error: error.message };
      }

      setTestResults(prev => ({
        ...prev,
        apiConnection: {
          status: 'error',
          message: errorMessage,
          details: errorDetails
        }
      }));
    }
  };

  const testSessionInit = async () => {
    setTestResults(prev => ({
      ...prev,
      sessionInit: { status: 'testing', message: 'Testing session initialization...', details: null }
    }));

    try {
      const newSessionId = await initializeSession();
      setSessionId(newSessionId);
      
      setTestResults(prev => ({
        ...prev,
        sessionInit: {
          status: 'success',
          message: `Session initialized successfully`,
          details: {
            sessionId: newSessionId,
            timestamp: new Date().toLocaleString()
          }
        }
      }));
    } catch (error) {
      let errorMessage = 'Failed to initialize session';
      let errorDetails = {};

      if (error.response) {
        errorMessage = `Session init failed: ${error.response.status} ${error.response.statusText}`;
        errorDetails = {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        };
      } else if (error.request) {
        errorMessage = 'No response from server';
        errorDetails = { requestError: error.message };
      } else {
        errorDetails = { error: error.message };
      }

      setTestResults(prev => ({
        ...prev,
        sessionInit: {
          status: 'error',
          message: errorMessage,
          details: errorDetails
        }
      }));
    }
  };

  const testMessageSend = async () => {
    if (!sessionId) {
      setTestResults(prev => ({
        ...prev,
        messageSend: {
          status: 'error',
          message: 'No session ID available. Initialize session first.',
          details: null
        }
      }));
      return;
    }

    setTestResults(prev => ({
      ...prev,
      messageSend: { status: 'testing', message: 'Testing message send...', details: null }
    }));

    try {
      const response = await sendMessageToChatbot(testMessage, sessionId);
      
      setTestResults(prev => ({
        ...prev,
        messageSend: {
          status: 'success',
          message: 'Message sent successfully',
          details: {
            sentMessage: testMessage,
            response: response.reply || response,
            timestamp: new Date().toLocaleString()
          }
        }
      }));
    } catch (error) {
      let errorMessage = 'Failed to send message';
      let errorDetails = {};

      if (error.response) {
        errorMessage = `Message send failed: ${error.response.status} ${error.response.statusText}`;
        errorDetails = {
          status: error.response.status,
          data: error.response.data,
          sentMessage: testMessage
        };
      } else if (error.request) {
        errorMessage = 'No response from server';
        errorDetails = { requestError: error.message, sentMessage: testMessage };
      } else {
        errorDetails = { error: error.message, sentMessage: testMessage };
      }

      setTestResults(prev => ({
        ...prev,
        messageSend: {
          status: 'error',
          message: errorMessage,
          details: errorDetails
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    setTestResults({
      authentication: { status: 'pending', message: 'Not tested', details: null },
      idToken: { status: 'pending', message: 'Not tested', details: null },
      apiConnection: { status: 'pending', message: 'Not tested', details: null },
      sessionInit: { status: 'pending', message: 'Not tested', details: null },
      messageSend: { status: 'pending', message: 'Not tested', details: null }
    });

    // Run tests sequentially
    testAuthentication();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testIdToken();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testApiConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testSessionInit();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (sessionId) {
      await testMessageSend();
    }

    setIsRunningAll(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'testing':
        return '⟳';
      default:
        return '○';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'testing':
        return styles.testing;
      default:
        return styles.pending;
    }
  };

  // Helper function to parse JWT
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Developer Testing Page</h1>
        <p className={styles.description}>
          Test each stage of chatbot communication to identify issues
        </p>

        <div className={styles.controls}>
          <button 
            onClick={runAllTests} 
            className={styles.runAllButton}
            disabled={isRunningAll}
          >
            {isRunningAll ? 'Running Tests...' : 'Run All Tests'}
          </button>
        </div>

        <div className={styles.testSection}>
          <h2>Connection Tests</h2>
          
          <div className={styles.testCard}>
            <div className={styles.testHeader}>
              <span className={`${styles.statusIcon} ${getStatusClass(testResults.authentication.status)}`}>
                {getStatusIcon(testResults.authentication.status)}
              </span>
              <h3>1. Authentication Status</h3>
              <button onClick={testAuthentication} className={styles.testButton}>
                Test
              </button>
            </div>
            <p className={styles.testMessage}>{testResults.authentication.message}</p>
            {testResults.authentication.details && (
              <details className={styles.details}>
                <summary>Details</summary>
                <pre>{JSON.stringify(testResults.authentication.details, null, 2)}</pre>
              </details>
            )}
          </div>

          <div className={styles.testCard}>
            <div className={styles.testHeader}>
              <span className={`${styles.statusIcon} ${getStatusClass(testResults.idToken.status)}`}>
                {getStatusIcon(testResults.idToken.status)}
              </span>
              <h3>2. ID Token Retrieval</h3>
              <button onClick={testIdToken} className={styles.testButton}>
                Test
              </button>
            </div>
            <p className={styles.testMessage}>{testResults.idToken.message}</p>
            {testResults.idToken.details && (
              <details className={styles.details}>
                <summary>Details</summary>
                <pre>{JSON.stringify(testResults.idToken.details, null, 2)}</pre>
              </details>
            )}
          </div>

          <div className={styles.testCard}>
            <div className={styles.testHeader}>
              <span className={`${styles.statusIcon} ${getStatusClass(testResults.apiConnection.status)}`}>
                {getStatusIcon(testResults.apiConnection.status)}
              </span>
              <h3>3. API Server Connection</h3>
              <button onClick={testApiConnection} className={styles.testButton}>
                Test
              </button>
            </div>
            <p className={styles.testMessage}>{testResults.apiConnection.message}</p>
            {testResults.apiConnection.details && (
              <details className={styles.details}>
                <summary>Details</summary>
                <pre>{JSON.stringify(testResults.apiConnection.details, null, 2)}</pre>
              </details>
            )}
          </div>

          <div className={styles.testCard}>
            <div className={styles.testHeader}>
              <span className={`${styles.statusIcon} ${getStatusClass(testResults.sessionInit.status)}`}>
                {getStatusIcon(testResults.sessionInit.status)}
              </span>
              <h3>4. Session Initialization</h3>
              <button onClick={testSessionInit} className={styles.testButton}>
                Test
              </button>
            </div>
            <p className={styles.testMessage}>{testResults.sessionInit.message}</p>
            {testResults.sessionInit.details && (
              <details className={styles.details}>
                <summary>Details</summary>
                <pre>{JSON.stringify(testResults.sessionInit.details, null, 2)}</pre>
              </details>
            )}
            {sessionId && (
              <div className={styles.sessionInfo}>
                <strong>Current Session ID:</strong> {sessionId}
              </div>
            )}
          </div>

          <div className={styles.testCard}>
            <div className={styles.testHeader}>
              <span className={`${styles.statusIcon} ${getStatusClass(testResults.messageSend.status)}`}>
                {getStatusIcon(testResults.messageSend.status)}
              </span>
              <h3>5. Message Sending</h3>
              <button onClick={testMessageSend} className={styles.testButton}>
                Test
              </button>
            </div>
            <div className={styles.messageInputContainer}>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Test message"
                className={styles.messageInput}
              />
            </div>
            <p className={styles.testMessage}>{testResults.messageSend.message}</p>
            {testResults.messageSend.details && (
              <details className={styles.details}>
                <summary>Details</summary>
                <pre>{JSON.stringify(testResults.messageSend.details, null, 2)}</pre>
              </details>
            )}
          </div>
        </div>

        <div className={styles.summary}>
          <h2>Connection Summary</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Authentication:</span>
              <span className={getStatusClass(testResults.authentication.status)}>
                {testResults.authentication.status}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>ID Token:</span>
              <span className={getStatusClass(testResults.idToken.status)}>
                {testResults.idToken.status}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>API Connection:</span>
              <span className={getStatusClass(testResults.apiConnection.status)}>
                {testResults.apiConnection.status}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Session Init:</span>
              <span className={getStatusClass(testResults.sessionInit.status)}>
                {testResults.sessionInit.status}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Message Send:</span>
              <span className={getStatusClass(testResults.messageSend.status)}>
                {testResults.messageSend.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;
