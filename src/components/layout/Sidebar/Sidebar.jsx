import { NavLink, useNavigate } from 'react-router-dom';
import { MdDashboard, MdChecklist, MdPeople, MdLogout, MdClose, MdBarChart, MdSettings } from 'react-icons/md';
import { RiAdminLine } from 'react-icons/ri';
import { useAuth } from '../../../context/AuthContext';
import styles from './Sidebar.module.css';

const USER_LINKS = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: MdChecklist, label: 'My Tasks' },
  { to: '/profile', icon: MdSettings, label: 'Profile & Settings' },
];

const ADMIN_LINKS = [
  { to: '/admin/dashboard', icon: RiAdminLine, label: 'Admin Overview' },
  { to: '/admin/tasks', icon: MdChecklist, label: 'All Tasks' },
  { to: '/admin/users', icon: MdPeople, label: 'All Users' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const links = isAdmin ? ADMIN_LINKS : USER_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>⚡</span>
            <span className={styles.logoName}>TaskFlow</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">
            <MdClose size={20} />
          </button>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{user?.name || 'User'}</p>
            <p className={styles.profileEmail}>{user?.email || ''}</p>
            <span className={`${styles.roleBadge} ${isAdmin ? styles.admin : styles.user}`}>
              {isAdmin ? '● Admin' : '● Member'}
            </span>
          </div>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navSection}>{isAdmin ? 'Admin Controls' : 'Main Menu'}</p>
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon className={styles.linkIcon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <MdLogout size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
