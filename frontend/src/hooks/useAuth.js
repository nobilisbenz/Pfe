import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { permissionService } from '../services/permission.service';

export const useAuth = () => {
    const auth = useAuthContext();

    const checkPermission = useCallback((permission) => {
        return permissionService.hasPermission(permission);
    }, []);

    const checkPermissions = useCallback((permissions) => {
        return permissionService.hasPermissions(permissions);
    }, []);

    const checkAnyPermission = useCallback((permissions) => {
        return permissionService.hasAnyPermission(permissions);
    }, []);

    const getAuthorizedActions = useCallback((module) => {
        return permissionService.getAuthorizedActions(module);
    }, []);

    return {
        ...auth,
        checkPermission,
        checkPermissions,
        checkAnyPermission,
        getAuthorizedActions,
        isAdmin: permissionService.isAdmin(),
        isTeacher: permissionService.isTeacher(),
        isStudent: permissionService.isStudent()
    };
};