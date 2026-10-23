import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useAuth } from '../auth/AuthContext.jsx';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user { id name email }
    }
  }
`;

export function Login() {
  const { onLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('Dev@123');
  const [login, { loading }] = useMutation(LOGIN);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ variables: { email, password } });
      await onLoggedIn(data.login);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="muted">DevAPI · Code With Azlo</p>
        <h1>Log in</h1>
        <p className="muted">
          GraphQL mutation <code>login</code> returns JWT tokens. The access
          token is sent on every later request as{' '}
          <code>Authorization: Bearer …</code>
        </p>
        <form onSubmit={onSubmit} className="auth-form">
          <label>Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="fail">{error}</p>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <p className="muted" style={{ marginTop: 14 }}>
          Seed accounts (password <code>Dev@123</code>):
          <br />
          test@gmail.com
          <br />
          test2@gmail.com
        </p>
        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
