import { useState, useEffect } from 'react';
import { MdPerson, MdEmail, MdLock, MdSave, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import AppLayout from '../components/layout/AppLayout/AppLayout';
import ErrorBoundary from '../components/common/ErrorBoundary/ErrorBoundary';
import Loader from '../components/common/Loader/Loader';
import { getProfileApi, updateProfileApi, changePasswordApi } from '../api/taskApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProfileApi();
        setProfile({ name: res.data.name, email: res.data.email });
        console.log('[ProfilePage] Loaded profile:', res.data.id);
      } catch (err) {
        console.error('[ProfilePage] Load error:', err);
        toast.error('Could not load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) { toast.error('Name and email are required.'); return; }
    setSavingProfile(true);
    try {
      await updateProfileApi(profile);
      await refreshUser();
      toast.success('Profile updated!');
      console.log('[ProfilePage] Profile updated');
    } catch (err) {
      console.error('[ProfilePage] Profile update error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.oldPassword || !pwForm.newPassword) { toast.error('All password fields are required.'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    setSavingPw(true);
    try {
      await changePasswordApi({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully.');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      console.log('[ProfilePage] Password changed');
    } catch (err) {
      console.error('[ProfilePage] Password error:', err);
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setSavingPw(false);
    }
  };

  if (loading) return <AppLayout title="Profile"><Loader message="Loading profile…" /></AppLayout>;

  const togglePw = (key) => setShowPw(p => ({ ...p, [key]: !p[key] }));

  return (
    <AppLayout title="Profile & Settings">
      <div className={styles.page}>
        {/* Profile Info */}
        <ErrorBoundary name="Profile Form">
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>{profile.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <div>
                <h2 className={styles.cardTitle}>Personal Information</h2>
                <p className={styles.cardSub}>Update your display name and email address.</p>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrap}>
                  <MdPerson className={styles.ico} />
                  <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                    className={styles.input} placeholder="Your name" required />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <MdEmail className={styles.ico} />
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    className={styles.input} placeholder="you@example.com" required />
                </div>
              </div>
              <button type="submit" className={styles.saveBtn} disabled={savingProfile}>
                {savingProfile ? <span className={styles.spinner} /> : <><MdSave size={16} /> Save Changes</>}
              </button>
            </form>
          </div>
        </ErrorBoundary>

        {/* Change Password */}
        <ErrorBoundary name="Password Form">
          <div className={styles.card}>
            <div className={styles.cardHeaderSimple}>
              <h2 className={styles.cardTitle}>Change Password</h2>
              <p className={styles.cardSub}>Keep your account secure with a strong password.</p>
            </div>
            <form onSubmit={handlePwSubmit} className={styles.form} noValidate>
              {[
                { key: 'old', name: 'oldPassword', label: 'Current Password', value: pwForm.oldPassword },
                { key: 'new', name: 'newPassword', label: 'New Password', value: pwForm.newPassword },
                { key: 'confirm', name: 'confirmPassword', label: 'Confirm New Password', value: pwForm.confirmPassword },
              ].map(({ key, name, label, value }) => (
                <div key={key} className={styles.field}>
                  <label className={styles.label}>{label}</label>
                  <div className={styles.inputWrap}>
                    <MdLock className={styles.ico} />
                    <input type={showPw[key] ? 'text' : 'password'} value={value}
                      onChange={e => setPwForm(p => ({ ...p, [name]: e.target.value }))}
                      className={styles.input} placeholder="••••••••" required />
                    <button type="button" className={styles.eyeBtn} onClick={() => togglePw(key)}>
                      {showPw[key] ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" className={styles.saveBtn} disabled={savingPw}>
                {savingPw ? <span className={styles.spinner} /> : <><MdLock size={16} /> Update Password</>}
              </button>
            </form>
          </div>
        </ErrorBoundary>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
