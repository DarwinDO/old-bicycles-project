import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../contexts/AuthContext';
import BikeLoader from '../components/common/BikeLoader';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const location = useLocation();
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <BikeLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
