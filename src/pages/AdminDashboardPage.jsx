import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  MdPeople, MdChecklist, MdDoneAll, MdHourglassTop,
  MdPendingActions, MdArrowForward, MdPerson, MdOpenInNew,
  MdAdd,
} from 'react-icons/md';
import ScrollReveal from 'scrollreveal';
import AppLayout from '../components/layout/AppLayout/AppLayout';
import StatsCard from '../components/dashboard/StatsCard';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Loader from '../components/common/Loader/Loader';
import AdminUserDetailModal from '../components/admin/AdminUserDetailModal';
import AdminTaskAssignModal from '../components/admin/AdminTaskAssignModal';
import { getAdminStatsApi, getAllTasksAdminApi, getAllUsersApi, deleteUserApi } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/tasks/TaskCard';
import styles from './AdminDashboardPage.module.css';

const ConfirmModal = lazy(() => import('../components/common/ConfirmModal/ConfirmModal'));

const AdminDashboard = () => {
  const toast = useToast();

  const [stats, setStats]             = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [detailUser, setDetailUser]   = useState(null);
  const [createOpen, setCreateOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const srDone = useRef(false);

  // ── Fetch all data ────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, tasksRes, usersRes] = await Promise.all([
          getAdminStatsApi(),
          getAllTasksAdminApi(0, 6),
          getAllUsersApi(),
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data?.content || []);
        setUsers(usersRes.data || []);
        console.log('[AdminDashboard] Stats:', statsRes.data);
        console.log('[AdminDashboard] Users loaded:', usersRes.data?.length);
      } catch (err) {
        console.error('[AdminDashboard] Fetch error:', err);
        toast.error('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── ScrollReveal ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !srDone.current) {
      srDone.current = true;
      const sr = ScrollReveal({
        distance: '20px', duration: 500,
        easing: 'cubic-bezier(.4,0,.2,1)', reset: false,
      });
      sr.reveal(`.${styles.statsGrid} > *`,  { origin: 'bottom', interval: 80 });
      sr.reveal(`.${styles.metricsRow} > *`, { origin: 'bottom', interval: 80, delay: 80 });
      sr.reveal(`.${styles.section}`,        { origin: 'bottom', interval: 100, delay: 120 });
    }
  }, [loading]);

  // ── Delete user (from drawer) ─────────────────────────────────────
  const handleDeleteFromDrawer = (user) => {
    setDetailUser(null);
    setDeleteTarget(user);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteUserApi(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      toast.success(`User "${deleteTarget.name}" deleted.`);
      console.log('[AdminDashboard] Deleted user:', deleteTarget.id);
    } catch (err) {
      console.error('[AdminDashboard] Delete user error:', err);
      toast.error('Failed to delete user.');
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <AppLayout title="Admin Overview"><Loader message="Loading admin data…" /></AppLayout>;

  const completionRate = stats?.totalTasks > 0
    ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <AppLayout title="Admin Overview">
      <div className={styles.page}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>System Overview</h2>
            <p className={styles.sub}>Monitor all users and tasks across the platform.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.createBtn} onClick={() => setCreateOpen(true)}>
              <MdAdd size={16} /> New Task
            </button>
            <Link to="/admin/users" className={styles.headerLink}>
              Manage Users <MdArrowForward size={14} />
            </Link>
            <Link to="/admin/tasks" className={styles.headerLink}>
              All Tasks <MdArrowForward size={14} />
            </Link>
          </div>
        </div>

        {/* ── Stats cards ─────────────────────────────────────── */}
        <ErrorBoundary name="Admin Stats">
          <div className={styles.statsGrid}>
            <StatsCard label="Total Users"   value={stats?.totalUsers}      icon={MdPeople}         color="blue"   />
            <StatsCard label="Total Tasks"   value={stats?.totalTasks}      icon={MdChecklist}      color="accent" />
            <StatsCard label="To Do"         value={stats?.todoTasks}       icon={MdPendingActions} color="accent" />
            <StatsCard label="In Progress"   value={stats?.inProgressTasks} icon={MdHourglassTop}   color="purple" />
            <StatsCard label="Done"          value={stats?.doneTasks}       icon={MdDoneAll}        color="green"  />
          </div>
        </ErrorBoundary>

        {/* ── System health metrics ───────────────────────────── */}
        <div className={styles.metricsRow}>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Completion Rate</p>
            <p className={styles.metricValue}>{completionRate}%</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${completionRate}%` }} />
            </div>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Active Tasks</p>
            <p className={styles.metricValue} style={{ color: 'var(--accent-blue)' }}>
              {(stats?.todoTasks || 0) + (stats?.inProgressTasks || 0)}
            </p>
            <p className={styles.metricHint}>TODO + In Progress</p>
          </div>
          <div className={styles.metricCard}>
            <p className={styles.metricLabel}>Avg Tasks / User</p>
            <p className={styles.metricValue} style={{ color: 'var(--accent-purple)' }}>
              {stats?.totalUsers > 0 ? (stats.totalTasks / stats.totalUsers).toFixed(1) : '—'}
            </p>
            <p className={styles.metricHint}>across all users</p>
          </div>
        </div>

        {/* ── Users overview ──────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Registered Users</h3>
            <Link to="/admin/users" className={styles.viewAll}>
              Manage all <MdArrowForward size={14} />
            </Link>
          </div>
          <ErrorBoundary name="Users Overview">
            {users.length === 0 ? (
              <div className={styles.empty}><p>No users registered yet.</p></div>
            ) : (
              <div className={styles.usersGrid}>
                {users.slice(0, 8).map(u => (
                  <button
                    key={u.id}
                    className={styles.userChip}
                    onClick={() => setDetailUser(u)}
                    title={`View details for ${u.name}`}
                  >
                    <div className={styles.chipAvatar}>{u.name?.charAt(0)?.toUpperCase()}</div>
                    <div className={styles.chipInfo}>
                      <p className={styles.chipName}>{u.name}</p>
                      <p className={styles.chipEmail}>{u.email}</p>
                    </div>
                    <MdOpenInNew className={styles.chipArrow} size={13} />
                  </button>
                ))}
                {users.length > 8 && (
                  <Link to="/admin/users" className={styles.moreUsers}>
                    +{users.length - 8} more
                  </Link>
                )}
              </div>
            )}
          </ErrorBoundary>
        </div>

        {/* ── Recent tasks ────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <h3 className={styles.sectionTitle}>Recent Tasks (All Users)</h3>
            <Link to="/admin/tasks" className={styles.viewAll}>
              View all <MdArrowForward size={14} />
            </Link>
          </div>
          <ErrorBoundary name="Recent Tasks">
            {recentTasks.length === 0 ? (
              <div className={styles.empty}>
                <p>No tasks in the system yet.</p>
                <button className={styles.createEmptyBtn} onClick={() => setCreateOpen(true)}>
                  <MdAdd size={14} /> Create First Task
                </button>
              </div>
            ) : (
              <div className={styles.taskGrid}>
                {recentTasks.map(t => (
                  <TaskCard key={t.id} task={t} showUser />
                ))}
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>

      {/* ── User detail drawer ───────────────────────────────── */}
      {detailUser && (
        <AdminUserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onUserDeleted={handleDeleteFromDrawer}
        />
      )}

      {/* ── Create task modal ────────────────────────────────── */}
      <AdminTaskAssignModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          // Reload recent tasks + stats
          Promise.all([getAdminStatsApi(), getAllTasksAdminApi(0, 6)]).then(([s, t]) => {
            setStats(s.data);
            setRecentTasks(t.data?.content || []);
          }).catch(e => console.error('[AdminDashboard] Reload after create error:', e));
        }}
      />

      {/* ── Delete user confirm ──────────────────────────────── */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteUser}
          title="Delete User"
          message={`Permanently delete "${deleteTarget?.name}" (${deleteTarget?.email})? All their tasks will also be deleted.`}
          confirmLabel="Delete User"
          loading={submitting}
        />
      </Suspense>
    </AppLayout>
  );
};

export default AdminDashboard;
