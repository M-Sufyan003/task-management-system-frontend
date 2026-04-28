import styles from './StatsCard.module.css';

const StatsCard = ({ label, value, icon: Icon, color = 'accent', trend }) => (
  <div className={`${styles.card} ${styles[color]}`}>
    <div className={styles.top}>
      <p className={styles.label}>{label}</p>
      {Icon && <span className={styles.icon}><Icon size={20} /></span>}
    </div>
    <p className={styles.value}>{value ?? '—'}</p>
    {trend && <p className={styles.trend}>{trend}</p>}
  </div>
);

export default StatsCard;
