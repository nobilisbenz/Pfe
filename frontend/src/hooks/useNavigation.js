import { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useResourcePermissions } from './useResourcePermissions';

export const useNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, userType } = useAuth();
    const { checkResourcePermission } = useResourcePermissions();

    // Routes protégées avec leurs permissions requises
    const protectedRoutes = useMemo(() => ({
        '/dashboard': { roles: ['admin', 'teacher', 'student'] },
        '/admin/*': { roles: ['admin'] },
        '/teachers/*': { roles: ['admin', 'teacher'] },
        '/students/*': { roles: ['admin', 'teacher', 'student'] },
        '/exams/create': { roles: ['admin', 'teacher'] },
        '/exams/edit/:id': { roles: ['admin', 'teacher'], check: 'exam_edit' },
        '/classes/*': { roles: ['admin', 'teacher'] },
        '/finances/*': { roles: ['admin'] }
    }), []);

    // Vérifier si une route est accessible
    const canAccessRoute = useCallback((path) => {
        if (!isAuthenticated) return false;

        const matchingRoute = Object.entries(protectedRoutes).find(([route]) => {
            const pattern = new RegExp('^' + route.replace('*', '.*') + '$');
            return pattern.test(path);
        });

        if (!matchingRoute) return true;

        const [, config] = matchingRoute;
        
        // Vérifier le rôle
        const hasRole = config.roles.includes(userType);
        if (!hasRole) return false;

        // Vérifier les permissions spécifiques
        if (config.check) {
            return checkResourcePermission(config.check);
        }

        return true;
    }, [isAuthenticated, userType, protectedRoutes, checkResourcePermission]);

    // Navigation sécurisée
    const navigateTo = useCallback((to, options = {}) => {
        const {
            replace = false,
            state = {},
            validateAccess = true
        } = options;

        if (validateAccess && !canAccessRoute(to)) {
            // Rediriger vers la page d'accès refusé
            navigate('/access-denied', {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        navigate(to, { replace, state });
    }, [navigate, location, canAccessRoute]);

    // Navigation avec historique
    const goBack = useCallback(() => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            // Fallback vers une route par défaut selon le rôle
            const defaultRoutes = {
                admin: '/admin/dashboard',
                teacher: '/teacher/dashboard',
                student: '/student/dashboard'
            };
            navigateTo(defaultRoutes[userType] || '/');
        }
    }, [navigate, userType, navigateTo]);

    // Obtenir l'URL précédente sécurisée
    const getPreviousUrl = useCallback(() => {
        const { state } = location;
        if (state?.from && canAccessRoute(state.from)) {
            return state.from;
        }
        return null;
    }, [location, canAccessRoute]);

    // Générer une URL avec des paramètres
    const generateUrl = useCallback((path, params = {}, query = {}) => {
        // Remplacer les paramètres dans l'URL
        let url = Object.entries(params).reduce(
            (acc, [key, value]) => acc.replace(`:${key}`, value),
            path
        );

        // Ajouter les paramètres de requête
        const queryString = Object.entries(query)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        if (queryString) {
            url += `?${queryString}`;
        }

        return url;
    }, []);

    // Générer des liens de navigation pour le menu
    const getNavigationLinks = useCallback(() => {
        const allLinks = {
            admin: [
                { to: '/admin/dashboard', label: 'Tableau de bord' },
                { to: '/admin/teachers', label: 'Enseignants' },
                { to: '/admin/students', label: 'Étudiants' },
                { to: '/admin/classes', label: 'Classes' },
                { to: '/admin/programs', label: 'Programmes' },
                { to: '/admin/exams', label: 'Examens' },
                { to: '/admin/finances', label: 'Finances' }
            ],
            teacher: [
                { to: '/teacher/dashboard', label: 'Tableau de bord' },
                { to: '/teacher/classes', label: 'Mes classes' },
                { to: '/teacher/exams', label: 'Mes examens' },
                { to: '/teacher/students', label: 'Mes étudiants' }
            ],
            student: [
                { to: '/student/dashboard', label: 'Tableau de bord' },
                { to: '/student/courses', label: 'Mes cours' },
                { to: '/student/exams', label: 'Mes examens' },
                { to: '/student/results', label: 'Mes résultats' }
            ]
        };

        return allLinks[userType] || [];
    }, [userType]);

    return {
        navigateTo,
        goBack,
        getPreviousUrl,
        generateUrl,
        canAccessRoute,
        getNavigationLinks,
        currentPath: location.pathname
    };
};