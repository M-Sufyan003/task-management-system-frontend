import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MdChecklist, MdDoneAll, MdHourglassTop, MdPendingActions, MdAdd, MdArrowForward } from 'react-icons/md';
import ScrollReveal from 'scrollreveal';
import AppLayout from '../components/layout/AppLayout/AppLayout';
import StatsCard from '../components/dashboard/StatsCard';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Loader from '../components/common/Loader/Loader';
import { getUserStatsApi, getMyTasksApi } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/tasks/TaskCard';
import styles from './DashboardPage.module.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const srRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          getUserStatsApi(),
          getMyTasksApi(0),
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data?.slice(0, 4) || []);
        console.log('[UserDashboard] Stats:', statsRes.data);
      } catch (err) {
        console.error('[UserDashboard] Fetch error:', err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const sr = ScrollReveal({ distance: '20px', duration: 500, easing: 'cubic-bezier(.4,0,.2,1)', reset: false });
      sr.reveal(`.${styles.statsGrid} > *`, { origin: 'bottom', interval: 80 });
      sr.reveal(`.${styles.section}`, { origin: 'bottom', interval: 100, delay: 150 });
      srRef.current = sr;
    }
  }, [loading]);

  if (loading) return (
    <AppLayout title="Dashboard">
      <Loader fullScreen={false} message="Loading dashboard..." />
    </AppLayout>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout title="Dashboard">
      <div className={styles.page}>
        {/* Welcome */}
        <div className={styles.welcome}>
          <div>
            <h2 className={styles.welcomeTitle}>{greeting}, {user?.name?.split(' ')[0]} 👋</h2>
            <p className={styles.welcomeSub}>Here's what's on your plate today.</p>
          </div>
          <Link to="/tasks" className={styles.newTaskBtn}>
            <MdAdd size={18} /> New Task
          </Link>
        </div>

        {/* Stats */}
        <ErrorBoundary name="Stats">
          <div className={styles.statsGrid}>
            <StatsCard label="Total Tasks"   value={stats?.totalTasks}       icon={MdChecklist}      color="blue" />
            <StatsCard label="To Do"         value={stats?.todoTasks}         icon={MdPendingActions}  color="accent" />
            <StatsCard label="In Progress"   value={stats?.inProgressTasks}   icon={MdHourglassTop}    color="purple" />
            <StatsCard label="Done"          value={stats?.doneTasks}          icon={MdDoneAll}         color="green" />
          </div>
        </ErrorBoundary>

        {/* Progress bar */}
        {stats?.totalTasks > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Overall Progress</span>
              <span className={styles.progressPct}>
                {Math.round((stats.doneTasks / stats.totalTasks) * 100)}% complete
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${(stats.doneTasks / stats.totalTasks) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Recent tasks */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Recent Tasks</h3>
            <Link to="/tasks" className={styles.viewAll}>
              View all <MdArrowForward size={15} />
            </Link>
          </div>
          <ErrorBoundary name="Recent Tasks">
            {recentTasks.length === 0 ? (
              <div className={styles.empty}>
                <p>No tasks yet.</p>
                <Link to="/tasks" className={styles.emptyLink}>Create your first task →</Link>
              </div>
            ) : (
              <div className={styles.taskGrid}>
                {recentTasks.map(t => (
                  <TaskCard key={t.id} task={t} />
                ))}
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </AppLayout>
  );
};

export default UserDashboard;
