import React from 'react';
import { SecurityProvider } from './contexts/SecurityContext';
import Navigation from './navigation/navigation';

function App() {
  return (
    <SecurityProvider>
      <Navigation />
    </SecurityProvider>
  );
}

export default App;
