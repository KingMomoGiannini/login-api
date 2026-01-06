import { Link, NavLink, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../api/http';

export default function TopNav() {
  const nav = useNavigate();
  const logged = !!getToken();

  function logout() {
    clearToken();
    nav('/login');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Auth UI</Link>

        <div className="navbar-nav gap-2">
          <NavLink className="nav-link" to="/register">Register</NavLink>
          <NavLink className="nav-link" to="/login">Login</NavLink>
          <NavLink className="nav-link" to="/me">Me</NavLink>
          <NavLink className="nav-link" to="/admin">Admin</NavLink>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge text-bg-secondary">
            {logged ? 'TOKEN OK' : 'SIN TOKEN'}
          </span>
          {logged && <button className="btn btn-sm btn-outline-light" onClick={logout}>Logout</button>}
        </div>
      </div>
    </nav>
  );
}
