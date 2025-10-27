import React, { useState } from 'react';

const ApiTester: React.FC = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginResult, setLoginResult] = useState<string | null>(null);

  const [taskUsername, setTaskUsername] = useState('');
  const [tasksResult, setTasksResult] = useState<string | null>(null);

  // Call /api/login
  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      setLoginResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setLoginResult('Error: ' + err.message);
    }
  };

  // Call /api/tasks
  const handleGetTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?username=${taskUsername}`);
      const data = await res.json();
      setTasksResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTasksResult('Error: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 50 }}>
      {/* Login Box */}
      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, width: 300 }}>
        <h3>Login API</h3>
        <input
          type="text"
          placeholder="Username"
          value={loginUsername}
          onChange={e => setLoginUsername(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button onClick={handleLogin} style={{ width: '100%', marginBottom: 10 }}>
          Call /api/login
        </button>
        <pre style={{ background: '#f9f9f9', padding: 10, borderRadius: 4 }}>
          {loginResult}
        </pre>
      </div>

      {/* Tasks Box */}
      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, width: 300 }}>
        <h3>Tasks API</h3>
        <input
          type="text"
          placeholder="Username"
          value={taskUsername}
          onChange={e => setTaskUsername(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button onClick={handleGetTasks} style={{ width: '100%', marginBottom: 10 }}>
          Call /api/tasks
        </button>
        <pre style={{ background: '#f9f9f9', padding: 10, borderRadius: 4 }}>
          {tasksResult}
        </pre>
      </div>
    </div>
  );
};

export default ApiTester;
