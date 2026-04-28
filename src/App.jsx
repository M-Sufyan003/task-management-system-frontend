import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './components/common/ProtectedRoute/ProtectedRoute';
import Loader from './components/common/Loader/Loader';

// Lazy-load all pages for code splitting & performance
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const DashboardPage     = lazy(() => import('./pages/DashboardPage'));
const TasksPage         = lazy(() => import('./pages/TasksPage'));
const ProfilePage       = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard    = lazy(() => import('./pages/AdminDashboardPage'));
const AdminTasksPage    = lazy(() => import('./pages/AdminTasksPage'));
const AdminUsersPage    = lazy(() => import('./pages/AdminUsersPage'));
const NotFoundPage      = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => <Loader fullScreen message="Loading…" />;

function App() {
  return (
    <ErrorBoundary name="Application Root">
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />

                {/* User routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <ErrorBoundary name="User Dashboard">
                      <DashboardPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <ErrorBoundary name="Tasks Page">
                      <TasksPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ErrorBoundary name="Profile Page">
                      <ProfilePage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute adminOnly>
                    <ErrorBoundary name="Admin Dashboard">
                      <AdminDashboard />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/admin/tasks" element={
                  <ProtectedRoute adminOnly>
                    <ErrorBoundary name="Admin Tasks">
                      <AdminTasksPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly>
                    <ErrorBoundary name="Admin Users">
                      <AdminUsersPage />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } />

                {/* Fallbacks */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
