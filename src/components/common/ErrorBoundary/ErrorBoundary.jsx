import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, info: null };

  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.icon}>⚠</div>
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.sub}>An unexpected error occurred in {this.props.name || 'this section'}.</p>
          {import.meta.env.DEV && (
            <details className={styles.details}>
              <summary>Dev error details</summary>
              <pre>{this.state.error?.toString()}{'\n'}{this.state.info?.componentStack}</pre>
            </details>
          )}
          <button className={styles.btn} onClick={() => { this.setState({ hasError:false, error:null, info:null }); }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
