import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/workspaces', label: 'Workspaces' },
  { to: '/explorer', label: 'GraphQL Explorer' },
  { to: '/guide', label: 'Beginner guide' },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>DevAPI</h1>
          <span className="badge">docs</span>
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
        <p className="sidebar-hint">
          Built day to day by <strong>Code With Azlo</strong>. One GraphQL
          endpoint: <code>POST /graphql</code>.
        </p>
        {user && (
          <div className="sidebar-user">
            <p>
              <strong>{user.name}</strong>
              <br />
              <span className="muted">{user.email}</span>
            </p>
            <button className="btn secondary" type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        )}
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
