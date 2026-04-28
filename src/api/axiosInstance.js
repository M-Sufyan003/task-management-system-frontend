import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (err) => { console.error('[API Request Error]', err); return Promise.reject(err); }
);

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message;
    console.error(`[API Response Error] ${status} — ${msg}`);
    if (status === 401) {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
