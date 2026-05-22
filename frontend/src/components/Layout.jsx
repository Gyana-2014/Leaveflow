import { useAuth } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="dot" />
          🗓️ LeaveFlow
        </div>
        <div className="topbar-right">
          <div className="user-badge">
            <span>{user?.name}</span>
            <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>
      <main className="main-content">{children}</main>
    </div>
  );
}
