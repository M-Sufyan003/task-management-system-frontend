import styles from './TaskStatusBadge.module.css';

// Maps backend enum values to display info
const STATUS_MAP = {
  TODO:        { label: 'To Do',       cls: 'todo' },
  IN_PROGRESS: { label: 'In Progress', cls: 'progress' },
  DONE:        { label: 'Done',        cls: 'done' },
};

const TaskStatusBadge = ({ status }) => {
  const info = STATUS_MAP[status] || { label: status, cls: 'todo' };
  return <span className={`${styles.badge} ${styles[info.cls]}`}>{info.label}</span>;
};

export default TaskStatusBadge;
