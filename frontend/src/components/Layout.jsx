import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Upload, CheckSquare, FileText, LogOut, TrendingUp, Building2, Sparkles, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/review', icon: CheckSquare, label: 'Review Center' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function Layout({ children }) {
  const { user, company, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon"><TrendingUp size={16} /></div>
          <span>FinOps</span>
          <Sparkles size={12} className="brand-sparkle" />
        </div>
        {company && (
          <div className="sidebar-company">
            <Building2 size={14} />
            <span>{company.name}</span>
          </div>
        )}
        <nav className="sidebar-nav">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/profile" className="user-email-link">
            <UserCircle size={15} />
            <span className="user-email">{user?.email}</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn" title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
