import { useState } from 'react';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdCheckCircle } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Modal from '../common/Modal/Modal';
import styles from './AuthModal.module.css';

const SignupModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signup, loading } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onChange = (e) => { setError(''); setForm(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    console.log('[SignupModal] Submitting signup for:', form.email);
    const result = await signup(form);

    if (result.success) {
      setSuccess(true);
      toast.success('Account created! You can now sign in.');
      setTimeout(() => { setSuccess(false); setForm({ name:'', email:'', password:'' }); onSwitchToLogin(); }, 1800);
    } else {
      setError(result.message);
      console.warn('[SignupModal] Signup failed:', result.message);
    }
  };

  if (success) return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Created!" size="sm">
      <div className={styles.successState}>
        <MdCheckCircle size={56} color="var(--accent-green)" />
        <p>Your account is ready. Redirecting to sign in…</p>
      </div>
    </Modal>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create your account" size="sm">
      <p className={styles.sub}>Join TaskFlow — manage your work smarter</p>

      {error && <div className={styles.errBanner} role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.field}>
          <label htmlFor="s-name" className={styles.label}>Full name</label>
          <div className={styles.inputWrap}>
            <MdPerson className={styles.icoL} />
            <input id="s-name" type="text" name="name" value={form.name}
              onChange={onChange} placeholder="John Doe"
              className={styles.input} autoComplete="name" required />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="s-email" className={styles.label}>Email address</label>
          <div className={styles.inputWrap}>
            <MdEmail className={styles.icoL} />
            <input id="s-email" type="email" name="email" value={form.email}
              onChange={onChange} placeholder="you@example.com"
              className={styles.input} autoComplete="email" required />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="s-pass" className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <MdLock className={styles.icoL} />
            <input id="s-pass" type={showPass ? 'text' : 'password'} name="password"
              value={form.password} onChange={onChange} placeholder="Min. 6 characters"
              className={styles.input} autoComplete="new-password" required />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(p => !p)}>
              {showPass ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
          <div className={styles.passHint}>
            {[6, 8, 12].map(n => (
              <span key={n} className={`${styles.bar} ${form.password.length >= n ? styles.barFill : ''}`} />
            ))}
            <span className={styles.passLabel}>
              {form.password.length === 0 ? 'Enter password' : form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Good' : 'Strong'}
            </span>
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : 'Create Account'}
        </button>
      </form>

      <p className={styles.switchText}>
        Already have an account?{' '}
        <button className={styles.switchLink} type="button" onClick={onSwitchToLogin}>Sign in</button>
      </p>
    </Modal>
  );
};

export default SignupModal;
