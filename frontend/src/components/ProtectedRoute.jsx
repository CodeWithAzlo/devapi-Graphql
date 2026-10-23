import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <p className="muted" style={{ padding: 40 }}>Loading session…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
