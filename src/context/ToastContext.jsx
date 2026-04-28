import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

// Inline toast container
const colors = { success: '#00c896', error: '#ff4d6d', info: '#4f8ef7', warning: '#f5a623' };
const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

const ToastContainer = ({ toasts, onRemove }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
    {toasts.map((t) => (
      <div key={t.id} onClick={() => onRemove(t.id)} style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px',
        background: '#181f30', border: `1px solid ${colors[t.type]}40`,
        borderLeft: `3px solid ${colors[t.type]}`, borderRadius: 12,
        cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        animation: 'slideInRight .25s ease', fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.875rem', color: '#e8eaf2', lineHeight: 1.4,
      }}>
        <span style={{ color: colors[t.type], fontWeight: 700, fontSize: '0.9rem', marginTop: 1 }}>{icons[t.type]}</span>
        <span>{t.message}</span>
      </div>
    ))}
    <style>{`@keyframes slideInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
  </div>
);
