import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../contexts/useAuth';

function ProtectedRoute({ requireAdmin = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    // Nếu là customer nhưng lại chui vào Admin route, đuổi ra trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
