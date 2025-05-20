import { authService } from './auth.service';

class PermissionService {
    // Définition des permissions par rôle
    #rolePermissions = {
        admin: [
            'manage_users',
            'manage_teachers',
            'manage_students',
            'manage_programs',
            'manage_classes',
            'manage_subjects',
            'manage_exams',
            'view_finances',
            'manage_finances',
            'publish_results',
            'manage_academic_years',
            'manage_academic_terms'
        ],
        teacher: [
            'view_own_profile',
            'edit_own_profile',
            'create_exams',
            'grade_exams',
            'view_assigned_classes',
            'view_assigned_subjects',
            'view_student_progress'
        ],
        student: [
            'view_own_profile',
            'edit_own_profile',
            'view_courses',
            'view_grades',
            'take_exams',
            'view_schedule',
            'submit_assignments'
        ]
    };

    // Vérifier si l'utilisateur a une permission spécifique
    hasPermission(permission) {
        const userType = authService.getUserType();
        if (!userType) return false;

        const permissions = this.#rolePermissions[userType] || [];
        return permissions.includes(permission);
    }

    // Vérifier si l'utilisateur a plusieurs permissions (toutes requises)
    hasPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    // Vérifier si l'utilisateur a au moins une des permissions
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    // Obtenir toutes les permissions de l'utilisateur actuel
    getUserPermissions() {
        const userType = authService.getUserType();
        return this.#rolePermissions[userType] || [];
    }

    // Vérifier si l'utilisateur est un administrateur
    isAdmin() {
        return authService.getUserType() === 'admin';
    }

    // Vérifier si l'utilisateur est un enseignant
    isTeacher() {
        return authService.getUserType() === 'teacher';
    }

    // Vérifier si l'utilisateur est un étudiant
    isStudent() {
        return authService.getUserType() === 'student';
    }

    // Vérifier si l'utilisateur peut accéder à une route
    canAccessRoute(requiredPermissions) {
        if (!authService.isAuthenticated()) return false;
        if (this.isAdmin()) return true; // Les administrateurs ont accès à tout
        return this.hasPermissions(requiredPermissions);
    }

    // Filtrer une liste d'éléments selon les permissions de l'utilisateur
    filterByPermission(items, requiredPermission) {
        if (this.hasPermission(requiredPermission)) {
            return items;
        }
        return [];
    }

    // Obtenir les actions autorisées pour un module spécifique
    getAuthorizedActions(module) {
        const allActions = {
            users: ['view', 'create', 'edit', 'delete'],
            exams: ['view', 'create', 'edit', 'delete', 'grade', 'publish'],
            courses: ['view', 'create', 'edit', 'delete', 'assign'],
            finances: ['view', 'create', 'edit', 'delete', 'approve']
        };

        const userType = authService.getUserType();
        if (!userType || !allActions[module]) return [];

        // Filtrer les actions selon le rôle
        switch (userType) {
            case 'admin':
                return allActions[module]; // Accès complet
            case 'teacher':
                return module === 'exams' ? ['view', 'create', 'edit', 'grade'] : ['view'];
            case 'student':
                return ['view'];
            default:
                return [];
        }
    }
}

export const permissionService = new PermissionService();