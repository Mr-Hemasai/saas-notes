import { useState } from 'react';
import axios from 'axios';

export default function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/login', { email, password });
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="app-card">
      <h2 style={{ fontSize: 28, letterSpacing: '-1px' }}>SaaS Notes Login</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 8 }}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={{ width: '100%', marginTop: 8 }}>Login</button>
      </form>
      {error && <div className="login-error">{error}</div>}
      <div className="login-demo-info">
        <b>Demo Accounts</b><br />admin@acme.test / password<br />user@acme.test / password
      </div>
    </div>
  );
}
