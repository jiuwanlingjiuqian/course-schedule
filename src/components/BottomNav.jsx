import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { path: '/', label: '课表', icon: '📅' },
  { path: '/import', label: '导入', icon: '📷' },
  { path: '/settings', label: '设置', icon: '⚙️' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.path}
          className={`nav-item ${location.pathname === tab.path ? 'active' : ''}`}
          onClick={() => navigate(tab.path)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
