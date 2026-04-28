import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal/Modal';
import styles from './AuthModal.module.css';

const LoginModal = ({ isOpen, onClose, onSwitchToSignup }) => {
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => { setError(''); setForm(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }

    console.log('[LoginModal] Submitting login for:', form.email);
    const result = await login(form);

    if (result.success) {
      toast.success(`Welcome back, ${result.user?.name?.split(' ')[0] || 'there'}!`);
      onClose();
      setForm({ email: '', password: '' });
      // Route based on role
      navigate(result.user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } else {
      setError(result.message);
      console.warn('[LoginModal] Login failed:', result.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign in to TaskFlow" size="sm">
      <p className={styles.sub}>Enter your credentials to continue</p>

      {error && <div className={styles.errBanner} role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="l-email" className={styles.label}>Email address</label>
          <div className={styles.inputWrap}>
            <MdEmail className={styles.icoL} />
            <input id="l-email" type="email" name="email" value={form.email}
              onChange={onChange} placeholder="you@example.com"
              className={styles.input} autoComplete="email" required />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="l-pass" className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <MdLock className={styles.icoL} />
            <input id="l-pass" type={showPass ? 'text' : 'password'} name="password"
              value={form.password} onChange={onChange} placeholder="••••••••"
              className={styles.input} autoComplete="current-password" required />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(p => !p)}>
              {showPass ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : 'Sign In'}
        </button>
      </form>

      <p className={styles.switchText}>
        Don't have an account?{' '}
        <button className={styles.switchLink} type="button" onClick={onSwitchToSignup}>Create one free</button>
      </p>
    </Modal>
  );
};

export default LoginModal;
