import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { MdAdd, MdFilterList, MdSearch, MdRefresh } from 'react-icons/md';
import AppLayout from '../components/layout/AppLayout/AppLayout';
import TaskCard from '../components/tasks/TaskCard';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Loader from '../components/common/Loader/Loader';
import { getMyTasksApi, createTaskApi, updateTaskApi, deleteTaskApi } from '../api/taskApi';
import { useToast } from '../context/ToastContext';
import styles from './TasksPage.module.css';

const TaskForm      = lazy(() => import('../components/tasks/TaskForm'));
const ConfirmModal  = lazy(() => import('../components/common/ConfirmModal/ConfirmModal'));

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const TasksPage = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTasks = useCallback(async (pg = 0, status = filter, reset = false) => {
    try {
      if (pg === 0) setLoading(true);
      const res = await getMyTasksApi(pg, status || null);
      const data = res.data || [];
      console.log(`[TasksPage] Loaded page ${pg}, count: ${data.length}`);
      setTasks(prev => reset || pg === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === 10);
      setPage(pg);
    } catch (err) {
      console.error('[TasksPage] Load error:', err);
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadTasks(0, filter, true); }, [filter]);

  // Create or update
  const handleFormSubmit = async (payload) => {
    setSubmitting(true);
    try {
      if (editTask) {
        const res = await updateTaskApi(editTask.id, payload);
        setTasks(prev => prev.map(t => t.id === editTask.id ? res.data : t));
        toast.success('Task updated successfully.');
        console.log('[TasksPage] Task updated:', res.data.id);
      } else {
        const res = await createTaskApi(payload);
        setTasks(prev => [res.data, ...prev]);
        toast.success('Task created!');
        console.log('[TasksPage] Task created:', res.data.id);
      }
      setFormOpen(false);
      setEditTask(null);
    } catch (err) {
      const msg = err?.response?.data?.title || err?.response?.data?.message || 'Operation failed.';
      console.error('[TasksPage] Submit error:', err);
      toast.error(typeof msg === 'string' ? msg : 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteTaskApi(deleteTarget.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success('Task deleted.');
      console.log('[TasksPage] Task deleted:', deleteTarget.id);
    } catch (err) {
      console.error('[TasksPage] Delete error:', err);
      toast.error('Failed to delete task.');
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  const openEdit = (task) => { setEditTask(task); setFormOpen(true); };
  const openCreate = () => { setEditTask(null); setFormOpen(true); };

  // Client-side search filter
  const displayed = search.trim()
    ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  return (
    <AppLayout title="My Tasks">
      <div className={styles.page}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <MdSearch className={styles.searchIco} />
              <input
                type="text"
                placeholder="Search tasks…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filters}>
              {FILTERS.map(f => (
                <button
                  key={f.value}
                  className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.toolbarRight}>
            <button className={styles.refreshBtn} onClick={() => loadTasks(0, filter, true)} title="Refresh">
              <MdRefresh size={18} />
            </button>
            <button className={styles.createBtn} onClick={openCreate}>
              <MdAdd size={18} /> New Task
            </button>
          </div>
        </div>

        {/* Task List */}
        <ErrorBoundary name="Task List">
          {loading ? (
            <Loader message="Loading tasks…" />
          ) : displayed.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📝</div>
              <h3 className={styles.emptyTitle}>No tasks found</h3>
              <p className={styles.emptySub}>
                {search ? 'Try a different search term.' : filter ? `No ${filter.toLowerCase().replace('_',' ')} tasks.` : 'Create your first task to get started.'}
              </p>
              {!search && !filter && (
                <button className={styles.createBtn} onClick={openCreate}>
                  <MdAdd size={16} /> Create Task
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={styles.count}>{displayed.length} task{displayed.length !== 1 ? 's' : ''}</div>
              <div className={styles.grid}>
                {displayed.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
              {hasMore && !search && (
                <button className={styles.loadMore} onClick={() => loadTasks(page + 1)}>
                  Load more
                </button>
              )}
            </>
          )}
        </ErrorBoundary>
      </div>

      <Suspense fallback={null}>
        <TaskForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditTask(null); }}
          onSubmit={handleFormSubmit}
          initialData={editTask}
          loading={submitting}
        />
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Task"
          message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
          loading={submitting}
        />
      </Suspense>
    </AppLayout>
  );
};

export default TasksPage;
