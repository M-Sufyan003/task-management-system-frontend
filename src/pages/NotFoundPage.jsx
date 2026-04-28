import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const home = isAuthenticated ? (isAdmin ? '/admin/dashboard' : '/dashboard') : '/';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to={home} className={styles.btn}>← Go Home</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
