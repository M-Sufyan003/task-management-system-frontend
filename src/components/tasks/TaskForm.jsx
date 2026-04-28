import { useState, useEffect } from 'react';
import { MdTitle, MdDescription, MdCalendarToday } from 'react-icons/md';
import Modal from '../common/Modal/Modal';
import styles from './TaskForm.module.css';

// Backend TaskStatus enum values
const STATUSES = [
  { value: 'TODO',        label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE',        label: 'Done' },
];

const EMPTY = { title: '', description: '', status: 'TODO', dueDate: '' };

const TaskForm = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setForm(initialData
        ? { title: initialData.title || '', description: initialData.description || '', status: initialData.status || 'TODO', dueDate: initialData.dueDate || '' }
        : EMPTY
      );
    }
  }, [isOpen, initialData]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setErrors(p => ({ ...p, [name]: '' }));
    setForm(p => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (!form.status) e.status = 'Status is required.';
    if (form.dueDate) {
      const today = new Date(); today.setHours(0,0,0,0);
      if (new Date(form.dueDate) < today) e.dueDate = 'Due date must be today or in the future.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Build payload matching TaskDTO — dueDate as LocalDate string (YYYY-MM-DD)
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      dueDate: form.dueDate || null,
    };
    console.log('[TaskForm] Submitting payload:', payload);
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Task' : 'Create New Task'} size="md">
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Title */}
        <div className={styles.field}>
          <label htmlFor="tf-title" className={styles.label}>Title <span className={styles.req}>*</span></label>
          <div className={styles.inputWrap}>
            <MdTitle className={styles.ico} />
            <input id="tf-title" name="title" type="text" value={form.title}
              onChange={onChange} placeholder="What needs to be done?"
              className={`${styles.input} ${errors.title ? styles.inputErr : ''}`} />
          </div>
          {errors.title && <p className={styles.err}>{errors.title}</p>}
        </div>

        {/* Description */}
        <div className={styles.field}>
          <label htmlFor="tf-desc" className={styles.label}>Description <span className={styles.opt}>(optional)</span></label>
          <div className={styles.textareaWrap}>
            <MdDescription className={styles.icoTextarea} />
            <textarea id="tf-desc" name="description" value={form.description}
              onChange={onChange} placeholder="Add details about this task…"
              className={styles.textarea} rows={3} />
          </div>
        </div>

        <div className={styles.row}>
          {/* Status */}
          <div className={styles.field}>
            <label htmlFor="tf-status" className={styles.label}>Status <span className={styles.req}>*</span></label>
            <select id="tf-status" name="status" value={form.status}
              onChange={onChange} className={`${styles.select} ${errors.status ? styles.inputErr : ''}`}>
              {STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {errors.status && <p className={styles.err}>{errors.status}</p>}
          </div>

          {/* Due Date */}
          <div className={styles.field}>
            <label htmlFor="tf-due" className={styles.label}>Due Date <span className={styles.opt}>(optional)</span></label>
            <div className={styles.inputWrap}>
              <MdCalendarToday className={styles.ico} />
              <input id="tf-due" name="dueDate" type="date" value={form.dueDate}
                onChange={onChange} min={new Date().toISOString().split('T')[0]}
                className={`${styles.input} ${errors.dueDate ? styles.inputErr : ''}`} />
            </div>
            {errors.dueDate && <p className={styles.err}>{errors.dueDate}</p>}
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
