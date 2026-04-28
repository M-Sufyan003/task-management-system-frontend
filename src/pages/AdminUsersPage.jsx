import { useEffect, useState, lazy, Suspense, useRef } from 'react';
import {
  MdSearch, MdRefresh, MdDelete, MdPerson, MdOpenInNew,
  MdPeople, MdInfo,
} from 'react-icons/md';
import ScrollReveal from 'scrollreveal';
import AppLayout from '../components/layout/AppLayout/AppLayout';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Loader from '../components/common/Loader/Loader';
import AdminUserDetailModal from '../components/admin/AdminUserDetailModal';
import { getAllUsersApi, deleteUserApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './AdminUsersPage.module.css';

const ConfirmModal = lazy(() => import('../components/common/ConfirmModal/ConfirmModal'));

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [search, setSearch]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailUser, setDetailUser]   = useState(null);   // user shown in drawer
  const srDone = useRef(false);

  // ── Load ───────────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoading(true);
    srDone.current = false;
    try {
      const res = await getAllUsersApi();
      setUsers(res.data || []);
      console.log('[AdminUsersPage] Loaded users:', res.data?.length);
    } catch (err) {
      console.error('[AdminUsersPage] Load error:', err);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // ScrollReveal after content loads
  useEffect(() => {
    if (!loading && !srDone.current) {
      srDone.current = true;
      const sr = ScrollReveal({ distance: '16px', duration: 450, easing: 'cubic-bezier(.4,0,.2,1)', reset: false });
      sr.reveal(`.${styles.tableWrap}`, { origin: 'bottom', delay: 60 });
    }
  }, [loading]);

  // ── Delete user ────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteUserApi(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      // Close detail drawer if we just deleted that user
      if (detailUser?.id === deleteTarget.id) setDetailUser(null);
      toast.success(`User "${deleteTarget.name}" deleted.`);
      console.log('[AdminUsersPage] Deleted user:', deleteTarget.id);
    } catch (err) {
      console.error('[AdminUsersPage] Delete error:', err);
      toast.error('Failed to delete user.');
    } finally {
      setSubmitting(false);
      setDeleteTarget(null);
    }
  };

  // Called from inside the detail drawer's danger zone
  const handleDeleteFromDrawer = (user) => {
    setDetailUser(null);           // close drawer first
    setDeleteTarget(user);         // then open confirm
  };

  // ── Filtered list ──────────────────────────────────────────────────
  const displayed = search.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const adminCount  = users.filter(u => u.role === 'ADMIN').length;
  const memberCount = users.length - adminCount;

  return (
    <AppLayout title="All Users">
      <div className={styles.page}>

        {/* ── Page header ───────────────────────────────────── */}
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>User Management</h2>
            <p className={styles.pageSub}>
              {!loading && (
                <><strong>{users.length}</strong> total · <strong>{memberCount}</strong> members</>
              )}
            </p>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────── */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <MdSearch className={styles.searchIco} />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button className={styles.refreshBtn} onClick={loadUsers} title="Refresh">
            <MdRefresh size={18} />
          </button>
        </div>

        {!loading && (
          <p className={styles.meta}>
            Showing {displayed.length} of {users.length} user{users.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Table ─────────────────────────────────────────── */}
        <ErrorBoundary name="User List">
          {loading ? (
            <Loader message="Loading users…" />
          ) : displayed.length === 0 ? (
            <div className={styles.empty}>
              <MdPeople size={40} />
              <h3>No users found</h3>
              <p>{search ? 'Try a different search.' : 'No users registered yet.'}</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Email</th>
                    <th>ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((u, i) => (
                    <tr
                      key={u.id}
                      className={u.id === currentUser?.id ? styles.selfRow : ''}
                    >
                      <td className={styles.idCell}>{i + 1}</td>

                      {/* User cell — clickable to open detail drawer */}
                      <td>
                        <button
                          className={styles.userCellBtn}
                          onClick={() => setDetailUser(u)}
                          title={`View details for ${u.name}`}
                        >
                          <div className={styles.avatar}>{u.name?.charAt(0)?.toUpperCase()}</div>
                          <div className={styles.userInfo}>
                            <p className={styles.userName}>{u.name}</p>
                            <div className={styles.badges}>
                              {u.id === currentUser?.id && (
                                <span className={styles.youBadge}>You</span>
                              )}
                            </div>
                          </div>
                          <MdOpenInNew className={styles.openIcon} size={13} />
                        </button>
                      </td>

                      <td className={styles.emailCell}>{u.email}</td>
                      <td className={styles.uidCell}>#{u.id}</td>

                      <td>
                        <div className={styles.actionCell}>
                          {/* View detail */}
                          <button
                            className={`${styles.actionBtn} ${styles.infoBtn}`}
                            onClick={() => setDetailUser(u)}
                            title="View user details & tasks"
                          >
                            <MdInfo size={14} /> Details
                          </button>

                          {/* Delete — protected for self */}
                          {u.id !== currentUser?.id ? (
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => setDeleteTarget(u)}
                              title="Delete user"
                            >
                              <MdDelete size={14} /> Delete
                            </button>
                          ) : (
                            <span className={styles.protectedBadge}>Protected</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* ── User detail drawer ──────────────────────────────── */}
      {detailUser && (
        <AdminUserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onUserDeleted={handleDeleteFromDrawer}
        />
      )}

      {/* ── Confirm delete modal ────────────────────────────── */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Permanently delete "${deleteTarget?.name}" (${deleteTarget?.email})? All their tasks will also be deleted. This cannot be undone.`}
          confirmLabel="Delete User"
          loading={submitting}
        />
      </Suspense>
    </AppLayout>
  );
};

export default AdminUsersPage;
