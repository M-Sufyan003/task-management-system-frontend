import { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader/Loader';
import styles from './LandingPage.module.css';

// Lazy-load modals
const LoginModal  = lazy(() => import('../components/auth/LoginModal'));
const SignupModal = lazy(() => import('../components/auth/SignupModal'));

const FEATURES = [
  { icon: '⚡', title: 'Lightning Fast', desc: 'Powered by a Spring Boot + JWT backend for sub-second API responses.' },
  { icon: '🔐', title: 'Secure by Design', desc: 'Role-based access control. Your tasks are completely private.' },
  { icon: '📊', title: 'Insightful Dashboard', desc: 'Track your progress with a live stats overview at a glance.' },
  { icon: '🛠', title: 'Admin Controls', desc: 'Full admin panel to manage all users and tasks system-wide.' },
];

const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'login' | 'signup' | null

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  return (
    <div className={styles.page}>
      {/* Animated background */}
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.grid} />
      </div>

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span>
          <span className={styles.brandName}>TaskFlow</span>
        </div>
        <div className={styles.navActions}>
          <button className={styles.loginBtn} onClick={() => setModal('login')}>Sign In</button>
          <button className={styles.signupBtn} onClick={() => setModal('signup')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>✦ Task Management System</div>
        <h1 className={styles.heroTitle}>
          Manage Work.<br />
          <span className={styles.highlight}>Stay Focused.</span>
        </h1>
        <p className={styles.heroCopy}>
          A role-based task platform where individuals track their own work
          and admins oversee everything — built with Spring Boot & React.
        </p>
        <div className={styles.heroCTA}>
          <button className={styles.ctaPrimary} onClick={() => setModal('signup')}>
            Start for Free
          </button>
          <button className={styles.ctaSecondary} onClick={() => setModal('login')}>
            Sign In →
          </button>
        </div>
        <div className={styles.heroStats}>
          {[['TODO', 'To-do tasks'], ['IN_PROGRESS', 'In progress'], ['DONE', 'Completed']].map(([s, l]) => (
            <div key={s} className={styles.heroStat}>
              <span className={`${styles.dot} ${styles[s.toLowerCase().replace('_','')]}`} />
              <span>{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <h2 className={styles.ctaBannerTitle}>Ready to take control?</h2>
        <p className={styles.ctaBannerSub}>Create your free account in seconds. No credit card required.</p>
        <button className={styles.ctaPrimary} onClick={() => setModal('signup')}>
          Create Free Account
        </button>
      </section>

      <footer className={styles.footer}>
        <span className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span> TaskFlow
        </span>
        <span className={styles.footerRight}>Built with Spring Boot + React</span>
      </footer>

      {/* Auth Modals — lazy loaded */}
      <Suspense fallback={<Loader fullScreen />}>
        <LoginModal
          isOpen={modal === 'login'}
          onClose={() => setModal(null)}
          onSwitchToSignup={() => setModal('signup')}
        />
        <SignupModal
          isOpen={modal === 'signup'}
          onClose={() => setModal(null)}
          onSwitchToLogin={() => setModal('login')}
        />
      </Suspense>
    </div>
  );
};

export default LandingPage;
