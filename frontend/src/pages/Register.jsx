import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '../auth/AuthContext.jsx';

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      accessToken
      refreshToken
      user { id name email }
    }
  }
`;

export function Register() {
  const { onLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { loading }] = useMutation(REGISTER);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await register({ variables: { name, email, password } });
      await onLoggedIn(data.register);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="muted">DevAPI · Code With Azlo</p>
        <h1>Sign up</h1>
        <p className="muted">
          Creates a User row (password hashed with bcrypt) and returns JWTs —
          same shape as login.
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label>Password (min 6)</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="fail">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
