import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/lib/store/store';
import Loader from '@/einstein/components/common/Loader';
import { featureFlags } from '@/lib/config/featureFlags';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // If auth is disabled, render children directly
  if (!featureFlags.isAuthEnabled) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
