import { useEffect, useState, useCallback, lazy, Suspense, useRef } from 'react';
import { MdFilterList, MdRefresh, MdSearch, MdAdd } from 'react-icons/md';
import ScrollReveal from 'scrollreveal';
import AppLayout from '../components/layout/AppLayout/AppLayout';
import TaskCard from '../components/tasks/TaskCard';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Loader from '../components/common/Loader/Loader';
import AdminTaskAssignModal from '../components/admin/AdminTaskAssignModal';
import { getAllTasksAdminApi, updateTaskAdminApi, deleteTaskAdminApi } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import styles from './AdminTasksPage.module.css';

const TaskForm     = lazy(() => import('../components/tasks/TaskForm'));
const ConfirmModal = lazy(() => import('../components/common/ConfirmModal/ConfirmModal'));

const FILTERS = [
  { value: '',            label: 'All' },
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done' },
];

const PAGE_SIZE = 10;

const AdminTasksPage = () => {
  const toast = useToast();

  const [tasks, setTasks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter]             = useState('');
  const [search, setSearch]             = useState('');
  const [editTask, setEditTask]         = useState(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [createOpen, setCreateOpen]     = useState(false);   // ← new: create task modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const srDone = useRef(false);

  // ── Load tasks ────────────────────────────────────────────────────
  const loadTasks = useCallback(async (pg = 0, status = filter) => {
    setLoading(true);
    srDone.current = false;
    try {
      const res = await getAllTasksAdminApi(pg, PAGE_SIZE, status || null);
      const pageData = res.data;
      setTasks(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setPage(pg);
      console.log(`[AdminTasksPage] Page ${pg}/${pageData.totalPages}, total: ${pageData.totalElements}`);
    } catch (err) {
      console.error('[AdminTasksPage] Load error:', err);
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadTasks(0, filter); }, [filter]);

  // ScrollReveal after content loads
  useEffect(() => {
    if (!loading && !srDone.current && tasks.length > 0) {
      srDone.current = true;
      const sr = ScrollReveal({ distance: '14px', duration: 400, easing: 'cubic-bezier(.4,0,.2,1)', reset: false });
      sr.reveal(`.${styles.grid} > *`, { origin: 'bottom', interval: 60 });
    }
  }, [loading, tasks.length]);

  // ── Update task ───────────────────────────────────────────────────
  const handleUpdate = async (payload) => {
    if (!editTask) return;
    setSubmitting(true);
    try {
      const res = await updateTaskAdminApi(editTask.id, payload);
      setTasks(prev => prev.map(t => (t.id === editTask.id ? res.data : t)));
      toast.success('Task updated.');
      console.log('[AdminTasksPage] Updated task:', editTask.id);
      setFormOpen(false);
      setEditTask(null);
    } catch (err) {
      console.error('[AdminTasksPage] Update error:', err);
      toast.error('Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete task ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteTaskAdminApi(deleteTarget.id);
      setTasks(prev => prev.filter(t => t.id !== deleteTarget.id));
      setTotalElements(p => p - 1);
      toast.success('Task deleted.');
      console.log('[AdminTasksPage] Deleted task:', deleteTarget.id);
    } catch (err) {
      console.error('[AdminTasksPage] Delete error:', err);
      toast.error('Failed to delete task.');
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  // ── After new task created ────────────────────────────────────────
  const handleTaskCreated = () => {
    setCreateOpen(false);
    loadTasks(0, filter);   // reload first page
  };

  // ── Client-side search filter ─────────────────────────────────────
  const displayed = search.trim()
    ? tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : tasks;

  return (
    <AppLayout title="All Tasks">
      <div className={styles.page}>

        {/* ── Page header ─────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Task Management</h2>
            <p className={styles.pageSub}>View, edit, or delete tasks from all users.</p>
          </div>
          <button className={styles.createBtn} onClick={() => setCreateOpen(true)}>
            <MdAdd size={18} /> New Task
          </button>
        </div>

        {/* ── Toolbar ─────────────────────────────────────── */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <MdSearch className={styles.searchIco} />
              <input
                type="text"
                placeholder="Search by title or user…"
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
          <button className={styles.refreshBtn} onClick={() => loadTasks(page, filter)} title="Refresh">
            <MdRefresh size={18} />
          </button>
        </div>

        {!loading && (
          <div className={styles.meta}>
            <span>{totalElements} total task{totalElements !== 1 ? 's' : ''}</span>
            {search && <span> · {displayed.length} match{displayed.length !== 1 ? 'es' : ''} search</span>}
          </div>
        )}

        {/* ── Task grid ────────────────────────────────────── */}
        <ErrorBoundary name="Admin Task List">
          {loading ? (
            <Loader message="Loading tasks…" />
          ) : displayed.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📋</div>
              <h3>No tasks found</h3>
              <p>{search ? 'Try a different search term.' : 'No tasks match the current filter.'}</p>
              {!search && (
                <button className={styles.createEmptyBtn} onClick={() => setCreateOpen(true)}>
                  <MdAdd size={15} /> Create First Task
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {displayed.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  showUser
                  onEdit={(task) => { setEditTask(task); setFormOpen(true); }}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </ErrorBoundary>

        {/* ── Pagination ───────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => loadTasks(page - 1)}
            >← Prev</button>
            <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => loadTasks(page + 1)}
            >Next →</button>
          </div>
        )}
      </div>

      {/* ── Create task modal ────────────────────────────────── */}
      <AdminTaskAssignModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleTaskCreated}
      />

      {/* ── Edit / Delete modals ─────────────────────────────── */}
      <Suspense fallback={null}>
        <TaskForm
          isOpen={formOpen}
          onClose={() => { setFormOpen(false); setEditTask(null); }}
          onSubmit={handleUpdate}
          initialData={editTask}
          loading={submitting}
        />
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Task"
          message={`Delete "${deleteTarget?.title}" (owned by ${deleteTarget?.user?.name || 'unknown'})? This cannot be undone.`}
          confirmLabel="Delete Task"
          loading={submitting}
        />
      </Suspense>
    </AppLayout>
  );
};

export default AdminTasksPage;
