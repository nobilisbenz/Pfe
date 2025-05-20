import { useCallback } from 'react';
import { useAuth } from './useAuth';

export const useResourcePermissions = (resourceType) => {
    const { user, checkPermission, isAdmin } = useAuth();

    // Vérifier les permissions de base sur une ressource
    const checkResourcePermission = useCallback((action, resource) => {
        if (isAdmin) return true;

        // Permissions générales sur le type de ressource
        const basePermission = `${resourceType}_${action}`;
        if (!checkPermission(basePermission)) return false;

        // Si pas de ressource spécifique, on vérifie juste la permission générale
        if (!resource) return true;

        // Vérifications spécifiques selon le type de ressource
        switch (resourceType) {
            case 'exam':
                if (action === 'edit' || action === 'delete') {
                    return resource.createdBy === user?._id;
                }
                if (action === 'view') {
                    return true; // Les examens sont visibles par tous les utilisateurs authentifiés
                }
                break;

            case 'class':
                if (action === 'edit') {
                    return resource.teachers?.includes(user?._id);
                }
                break;

            case 'student':
                if (action === 'view_details') {
                    return resource.teachers?.includes(user?._id) || 
                           resource._id === user?._id;
                }
                break;

            case 'result':
                if (action === 'view') {
                    return resource.studentId === user?._id || 
                           resource.teacherId === user?._id;
                }
                break;

            default:
                return false;
        }

        return false;
    }, [resourceType, user, checkPermission, isAdmin]);

    // Vérifier si l'utilisateur peut créer une ressource
    const canCreate = useCallback(() => {
        return checkResourcePermission('create');
    }, [checkResourcePermission]);

    // Vérifier si l'utilisateur peut voir une ressource
    const canView = useCallback((resource) => {
        return checkResourcePermission('view', resource);
    }, [checkResourcePermission]);

    // Vérifier si l'utilisateur peut modifier une ressource
    const canEdit = useCallback((resource) => {
        return checkResourcePermission('edit', resource);
    }, [checkResourcePermission]);

    // Vérifier si l'utilisateur peut supprimer une ressource
    const canDelete = useCallback((resource) => {
        return checkResourcePermission('delete', resource);
    }, [checkResourcePermission]);

    // Obtenir toutes les actions autorisées sur une ressource
    const getAuthorizedActions = useCallback((resource) => {
        const actions = ['view', 'edit', 'delete'];
        return actions.filter(action => checkResourcePermission(action, resource));
    }, [checkResourcePermission]);

    // Filtrer une liste de ressources selon les permissions
    const filterAuthorizedResources = useCallback((resources, action = 'view') => {
        if (!Array.isArray(resources)) return [];
        return resources.filter(resource => checkResourcePermission(action, resource));
    }, [checkResourcePermission]);

    return {
        checkResourcePermission,
        canCreate,
        canView,
        canEdit,
        canDelete,
        getAuthorizedActions,
        filterAuthorizedResources
    };
};