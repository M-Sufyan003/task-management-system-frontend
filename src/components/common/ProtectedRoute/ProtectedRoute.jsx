import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../Loader/Loader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <Loader fullScreen message="Checking access..." />;

  if (!isAuthenticated) {
    console.warn('[ProtectedRoute] Not authenticated — redirect to /');
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.warn('[ProtectedRoute] Admin only route — redirect to /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
