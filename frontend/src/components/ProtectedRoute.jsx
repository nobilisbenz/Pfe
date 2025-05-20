import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const userRole = authService.getUserRole();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Vérifier si l'utilisateur a le rôle requis
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        // Rediriger vers le dashboard approprié en fonction du rôle
        const dashboardPath = `/${userRole}/dashboard`;
        return <Navigate to={dashboardPath} replace />;
    }

    return children;
};

export default ProtectedRoute;