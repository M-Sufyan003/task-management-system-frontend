import { createContext, useContext, useState, useCallback } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import { getProfileApi } from '../api/taskApi';
import { getRoleFromToken, isTokenExpired } from '../utils/jwtUtils';

const AuthContext = createContext(null);

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('tm_token');
    const user = JSON.parse(localStorage.getItem('tm_user') || 'null');
    if (token && !isTokenExpired(token) && user) return { token, user };
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    return { token: null, user: null };
  } catch { return { token: null, user: null }; }
};

export const AuthProvider = ({ children }) => {
  const stored = getStoredAuth();
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const res = await loginApi(credentials);
      const { token: jwt, message } = res.data;

      // Detect role from token claims
      const role = getRoleFromToken(jwt);
      console.log('[AuthContext] Login — detected role:', role);

      // Fetch profile to get name + id
      localStorage.setItem('tm_token', jwt);
      let profileData = { id: null, name: credentials.email, email: credentials.email };
      try {
        const profileRes = await getProfileApi();
        profileData = profileRes.data;
      } catch (e) {
        console.warn('[AuthContext] Could not fetch profile after login:', e);
      }

      const userData = { ...profileData, role };
      localStorage.setItem('tm_user', JSON.stringify(userData));
      setToken(jwt);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      localStorage.removeItem('tm_token');
      const msg = err?.response?.data?.message || err?.response?.data || 'Login failed.';
      console.error('[AuthContext] Login error:', msg);
      return { success: false, message: typeof msg === 'string' ? msg : 'Login failed.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await signupApi(data);
      return { success: true, message: res.data?.message };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Signup failed.';
      console.error('[AuthContext] Signup error:', msg);
      return { success: false, message: typeof msg === 'string' ? msg : 'Signup failed.' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    setToken(null);
    setUser(null);
    console.log('[AuthContext] User logged out');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getProfileApi();
      const updated = { ...user, ...res.data };
      setUser(updated);
      localStorage.setItem('tm_user', JSON.stringify(updated));
    } catch (e) {
      console.error('[AuthContext] refreshUser failed:', e);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ token, user, loading, isAuthenticated, isAdmin, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
