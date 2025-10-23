import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [box1Data, setBox1Data] = useState<string>('');
  const [box2Data, setBox2Data] = useState<string>('');
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // Box 3 state
  const [box3Username, setBox3Username] = useState('');
  const [box3Password, setBox3Password] = useState('');
  const [box3Data, setBox3Data] = useState<string>('');
  const [loading3, setLoading3] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin();
    }
  };

  const handleBox1Fetch = async () => {
    setLoading1(true);
    setBox1Data('');
    try {
      const res = await fetch('/api1');
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const data = await res.json();
      setBox1Data(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Error fetching Box 1:', err);
      setBox1Data(`Error fetching Box 1:\n${err.message}`);
    } finally {
      setLoading1(false);
    }
  };

  const handleBox2Fetch = async () => {
    setLoading2(true);
    setBox2Data('');
    try {
      const res = await fetch('/api2');
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      const data = await res.json();
      setBox2Data(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Error fetching Box 2:', err);
      setBox2Data(`Error fetching Box 2:\n${err.message}`);
    } finally {
      setLoading2(false);
    }
  };

  // New Box 3 fetch (validate username/password)
  const handleBox3Validate = async () => {
    setLoading3(true);
    setBox3Data('');
    try {
      const res = await fetch('/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: box3Username, password: box3Password }),
      });
      const data = await res.json();
      setBox3Data(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Error validating credentials:', err);
      setBox3Data(`Error validating credentials:\n${err.message}`);
    } finally {
      setLoading3(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Login</button>
      </form>

      <hr style={{ margin: '20px 0' }} />

      {/* Box 1 */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={handleBox1Fetch} disabled={loading1} style={{ width: '100%', marginBottom: 10 }}>
          {loading1 ? 'Loading Box 1...' : 'Fetch Box 1 Data'}
        </button>
        <textarea
          readOnly
          value={box1Data}
          placeholder="Box 1 data will appear here"
          style={{ width: '100%', height: 100 }}
        />
      </div>

      {/* Box 2 */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={handleBox2Fetch} disabled={loading2} style={{ width: '100%', marginBottom: 10 }}>
          {loading2 ? 'Loading Box 2...' : 'Fetch Box 2 Data'}
        </button>
        <textarea
          readOnly
          value={box2Data}
          placeholder="Box 2 data will appear here"
          style={{ width: '100%', height: 100 }}
        />
      </div>

      {/* Box 3 (Validate) */}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={box3Username}
          onChange={e => setBox3Username(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={box3Password}
          onChange={e => setBox3Password(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button onClick={handleBox3Validate} disabled={loading3} style={{ width: '100%', marginBottom: 10 }}>
          {loading3 ? 'Validating...' : 'Validate Credentials'}
        </button>
        <textarea
          readOnly
          value={box3Data}
          placeholder="Validation result will appear here"
          style={{ width: '100%', height: 100 }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
