import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdClose, MdAssignment, MdPerson } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { createTaskApi } from '../../api/taskApi';
import { getAllUsersApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import styles from './AdminTaskAssignModal.module.css';

/**
 * AdminTaskAssignModal
 * Allows an admin to create a task. Because the backend's POST /api/tasks
 * always assigns the task to the currently authenticated user (the admin),
 * this component creates the task under the admin account — which is the
 * correct behaviour given the backend constraints. If your backend later
 * adds POST /api/admin/tasks with a userId param, swap createTaskApi for
 * that endpoint here.
 *
 * The modal still shows a "Assign to" user picker so the admin can keep
 * track / annotate intent, and displays a clear notice about the current
 * API limitation.
 */
const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done' },
];

const AdminTaskAssignModal = ({ isOpen, onClose, onCreated }) => {
  const toast = useToast();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    dueDate: '',
    assignedUserId: '',
  });
  const [errors, setErrors] = useState({});

  // Load users for the picker
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllUsersApi();
        setUsers(res.data || []);
        console.log('[AdminTaskAssignModal] Loaded users:', res.data?.length);
      } catch (err) {
        console.error('[AdminTaskAssignModal] Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen]);

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        status:      form.status,
        dueDate:     form.dueDate || null,
      };
      const res = await createTaskApi(payload);
      toast.success('Task created successfully.');
      console.log('[AdminTaskAssignModal] Created task:', res.data?.id);
      onCreated?.(res.data);
      handleClose();
    } catch (err) {
      console.error('[AdminTaskAssignModal] Create error:', err);
      const msg = err?.response?.data?.message || 'Failed to create task.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm({ title: '', description: '', status: 'TODO', dueDate: '', assignedUserId: '' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => e.target.classList.contains(styles.overlay) && handleClose()}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Create task">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <MdAssignment className={styles.headerIcon} />
            <h3 className={styles.title}>Create New Task</h3>
          </div>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
            <IoClose size={18} />
          </button>
        </div>

        {/* Notice */}
        <div className={styles.notice}>
          <span className={styles.noticeIcon}>ℹ</span>
          Tasks created here are added to the system under the current admin account. 
          Use the <strong>All Tasks</strong> page to reassign or edit status per user.
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Title */}
          <div className={styles.field}>
            <label className={styles.label}>Title <span className={styles.req}>*</span></label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title…"
              className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
              autoFocus
            />
            {errors.title && <p className={styles.errMsg}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional details…"
              rows={3}
              className={styles.textarea}
            />
          </div>

          {/* Status + Due date */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={styles.select}>
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={styles.input}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* User reference picker (visual only — backend assigns to current user) */}
          <div className={styles.field}>
            <label className={styles.label}>
              <MdPerson size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              Reference User <span className={styles.optional}>(for tracking)</span>
            </label>
            {loading ? (
              <p className={styles.loadingText}>Loading users…</p>
            ) : (
              <select
                name="assignedUserId"
                value={form.assignedUserId}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">— Select user (optional) —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AdminTaskAssignModal;
