import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Protects routes that require authentication.
 * Redirects to login page if user is not authenticated.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const location = useLocation();

    // TODO: Replace with actual auth check from your auth context/store
    const isAuthenticated = Boolean(localStorage.getItem('authToken'));

    if (!isAuthenticated) {
        // Redirect to login, but save the attempted URL
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
