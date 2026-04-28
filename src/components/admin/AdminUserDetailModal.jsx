import { useEffect, useState, lazy, Suspense } from 'react';
import {
  MdPerson, MdEmail, MdChecklist, MdDoneAll, MdHourglassTop,
  MdPendingActions, MdClose, MdDelete, MdEdit, MdRefresh,
} from 'react-icons/md';
import { createPortal } from 'react-dom';
import TaskStatusBadge from '../tasks/TaskStatusBadge';
import Loader from '../common/Loader/Loader';
import { getTasksByUserAdminApi, deleteTaskAdminApi, updateTaskAdminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import styles from './AdminUserDetailModal.module.css';

const TaskForm     = lazy(() => import('../tasks/TaskForm'));
const ConfirmModal = lazy(() => import('../common/ConfirmModal/ConfirmModal'));

const AdminUserDetailModal = ({ user, onClose, onUserDeleted }) => {
  const toast = useToast();
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editTask, setEditTask]       = useState(null);
  const [formOpen, setFormOpen]       = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  // ── stats derived from tasks ─────────────────────────────────────────
  const stats = {
    total:      tasks.length,
    todo:       tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done:       tasks.filter(t => t.status === 'DONE').length,
  };

  const loadTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getTasksByUserAdminApi(user.id, 0, 100);
      setTasks(res.data?.content || []);
      console.log(`[AdminUserDetailModal] Loaded ${res.data?.content?.length} tasks for user ${user.id}`);
    } catch (err) {
      console.error('[AdminUserDetailModal] Failed to load tasks:', err);
      toast.error('Could not load user tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadTasks();
    // Block body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [user]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── handlers ─────────────────────────────────────────────────────────
  const handleUpdateTask = async (payload) => {
    if (!editTask) return;
    setSubmitting(true);
    try {
      const res = await updateTaskAdminApi(editTask.id, payload);
      setTasks(prev => prev.map(t => (t.id === editTask.id ? res.data : t)));
      toast.success('Task updated.');
      console.log('[AdminUserDetailModal] Updated task:', editTask.id);
      setFormOpen(false);
      setEditTask(null);
    } catch (err) {
      console.error('[AdminUserDetailModal] Update error:', err);
      toast.error('Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteTaskAdminApi(deleteTarget.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Task deleted.');
      console.log('[AdminUserDetailModal] Deleted task:', deleteTarget.id);
    } catch (err) {
      console.error('[AdminUserDetailModal] Delete error:', err);
      toast.error('Failed to delete task.');
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  if (!user) return null;

  const initial = user.name?.charAt(0)?.toUpperCase() || 'U';

  return createPortal(
    <div className={styles.overlay} onClick={(e) => e.target.classList.contains(styles.overlay) && onClose()}>
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={`User details — ${user.name}`}>

        {/* ── Header ───────────────────────────────────────── */}
        <div className={styles.drawerHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.avatar}>{initial}</div>
            <div>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userEmail}><MdEmail size={13} /> {user.email}</p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.refreshBtn} onClick={loadTasks} title="Refresh tasks">
              <MdRefresh size={17} />
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <MdClose size={20} />
            </button>
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────── */}
        <div className={styles.statsStrip}>
          <div className={`${styles.statChip} ${styles.chipTotal}`}>
            <MdChecklist size={15} />
            <span><strong>{stats.total}</strong> Total</span>
          </div>
          <div className={`${styles.statChip} ${styles.chipTodo}`}>
            <MdPendingActions size={15} />
            <span><strong>{stats.todo}</strong> To Do</span>
          </div>
          <div className={`${styles.statChip} ${styles.chipProgress}`}>
            <MdHourglassTop size={15} />
            <span><strong>{stats.inProgress}</strong> In Progress</span>
          </div>
          <div className={`${styles.statChip} ${styles.chipDone}`}>
            <MdDoneAll size={15} />
            <span><strong>{stats.done}</strong> Done</span>
          </div>
        </div>

        {/* ── Task list ─────────────────────────────────────── */}
        <div className={styles.taskSection}>
          <p className={styles.sectionLabel}>TASKS</p>

          {loading ? (
            <Loader message="Loading tasks…" />
          ) : tasks.length === 0 ? (
            <div className={styles.empty}>
              <MdChecklist size={32} />
              <p>This user has no tasks yet.</p>
            </div>
          ) : (
            <div className={styles.taskList}>
              {tasks.map(task => {
                const overdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();
                return (
                  <div key={task.id} className={styles.taskRow}>
                    <div className={styles.taskRowLeft}>
                      <TaskStatusBadge status={task.status} />
                      <div className={styles.taskInfo}>
                        <p className={styles.taskTitle}>{task.title}</p>
                        {task.dueDate && (
                          <p className={`${styles.taskDue} ${overdue ? styles.overdue : ''}`}>
                            {overdue ? '⚠ Overdue · ' : ''}{task.dueDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={styles.taskRowActions}>
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => { setEditTask(task); setFormOpen(true); }}
                        title="Edit task"
                      >
                        <MdEdit size={15} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delBtn}`}
                        onClick={() => setDeleteTarget(task)}
                        title="Delete task"
                      >
                        <MdDelete size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Danger zone ───────────────────────────────────── */}
        <div className={styles.dangerZone}>
          <p className={styles.dangerLabel}>DANGER ZONE</p>
          <button className={styles.deleteUserBtn} onClick={() => onUserDeleted(user)}>
            <MdDelete size={16} /> Delete User &amp; All Their Tasks
          </button>
        </div>
      </div>

      {/* Sub-modals */}
      <Suspense fallback={null}>
        <TaskForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditTask(null); }}
          onSubmit={handleUpdateTask}
          initialData={editTask}
          loading={submitting}
        />
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteTask}
          title="Delete Task"
          message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
          confirmLabel="Delete Task"
          loading={submitting}
        />
      </Suspense>
    </div>,
    document.body
  );
};

export default AdminUserDetailModal;
