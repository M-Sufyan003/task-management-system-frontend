import { MdEdit, MdDelete, MdCalendarToday, MdPerson } from 'react-icons/md';
import TaskStatusBadge from './TaskStatusBadge';
import styles from './TaskCard.module.css';

const TaskCard = ({ task, onEdit, onDelete, showUser = false }) => {
  const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date();

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <TaskStatusBadge status={task.status} />
        <div className={styles.actions}>
          {onEdit && (
            <button className={`${styles.btn} ${styles.edit}`} onClick={() => onEdit(task)} title="Edit task">
              <MdEdit size={16} />
            </button>
          )}
          {onDelete && (
            <button className={`${styles.btn} ${styles.del}`} onClick={() => onDelete(task)} title="Delete task">
              <MdDelete size={16} />
            </button>
          )}
        </div>
      </div>

      <h3 className={styles.title}>{task.title}</h3>

      {task.description && (
        <p className={styles.desc}>{task.description}</p>
      )}

      <div className={styles.meta}>
        {task.dueDate && (
          <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
            <MdCalendarToday size={13} />
            {isOverdue ? 'Overdue · ' : ''}{task.dueDate}
          </span>
        )}
        {showUser && task.user && (
          <span className={styles.user}>
            <MdPerson size={13} />
            {task.user.name}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
