import styles from './Loader.module.css';

const Loader = ({ fullScreen = false, size = 'md', message }) => (
  <div className={`${styles.wrap} ${fullScreen ? styles.full : ''} ${styles[size]}`}>
    <div className={styles.ring}>
      <span /><span /><span />
    </div>
    {message && <p className={styles.msg}>{message}</p>}
  </div>
);

export default Loader;
