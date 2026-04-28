import { MdMenu } from 'react-icons/md';
import { useAuth } from '../../../context/AuthContext';
import styles from './Topbar.module.css';

const Topbar = ({ onMenuClick, title }) => {
  const { user, isAdmin } = useAuth();
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <button className={styles.menu} onClick={onMenuClick} aria-label="Toggle menu"><MdMenu size={22} /></button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.chip}>
          <div className={styles.av}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <span className={styles.name}>{user?.name?.split(' ')[0]}</span>
          <span className={`${styles.role} ${isAdmin ? styles.adminRole : styles.userRole}`}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
