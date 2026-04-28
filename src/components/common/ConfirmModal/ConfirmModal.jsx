import Modal from '../Modal/Modal';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'} size="sm">
    <p className={styles.msg}>{message || 'Are you sure? This action cannot be undone.'}</p>
    <div className={styles.actions}>
      <button className={styles.cancel} onClick={onClose} disabled={loading}>Cancel</button>
      <button className={styles.confirm} onClick={onConfirm} disabled={loading}>
        {loading ? <span className={styles.spinner} /> : confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmModal;
