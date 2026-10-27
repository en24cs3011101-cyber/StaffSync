import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Dashboard', roles: ['hr', 'manager', 'employee'], end: true },
  { to: '/employees', label: 'Employees', roles: ['hr', 'manager'] },
  { to: '/leaves', label: 'Leaves', roles: ['hr', 'manager', 'employee'] },
  { to: '/attendance', label: 'Attendance', roles: ['hr', 'manager', 'employee'] },
  { to: '/announcements', label: 'News', roles: ['hr', 'manager', 'employee'] },
  { to: '/training', label: 'Training', roles: ['hr', 'manager', 'employee'] },
  { to: '/profile', label: 'My Profile', roles: ['hr', 'manager', 'employee'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark ss-nav">
      <div className="container">
        <span className="navbar-brand">StaffSync</span>
        <button className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto">
            {links.filter((l) => l.roles.includes(user.role)).map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink to={l.to} end={l.end} className="nav-link">{l.label}</NavLink>
              </li>
            ))}
          </ul>
          <span className="text-light me-3 small">{user.name} ({user.role})</span>
          <button className="btn btn-outline-light btn-sm" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
        </div>
      </div>
    </nav>
  );
}
