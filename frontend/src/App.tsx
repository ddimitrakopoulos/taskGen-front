import React, { useState } from 'react';
import LoginPage from './LoginPage';
import TaskApp from './TaskApp';

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return loggedIn ? (
    <TaskApp />
  ) : (
    <LoginPage onLogin={() => setLoggedIn(true)} />
  );
};

export default App;
