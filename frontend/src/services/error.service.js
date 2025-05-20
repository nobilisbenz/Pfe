class ErrorService {
    handleError(error) {
        if (error.response) {
            // Erreur de réponse du serveur
            const status = error.response.status;
            const message = error.response.data?.message || 'Une erreur est survenue';

            switch (status) {
                case 400:
                    return {
                        type: 'VALIDATION_ERROR',
                        message
                    };
                case 401:
                    // Rediriger vers la page de connexion
                    window.location.href = '/login';
                    return {
                        type: 'AUTH_ERROR',
                        message: 'Session expirée. Veuillez vous reconnecter.'
                    };
                case 403:
                    return {
                        type: 'PERMISSION_ERROR',
                        message: 'Accès non autorisé'
                    };
                case 404:
                    return {
                        type: 'NOT_FOUND',
                        message: 'Ressource non trouvée'
                    };
                case 500:
                    return {
                        type: 'SERVER_ERROR',
                        message: 'Erreur serveur. Veuillez réessayer plus tard.'
                    };
                default:
                    return {
                        type: 'UNKNOWN_ERROR',
                        message
                    };
            }
        }

        if (error.request) {
            // Erreur de réseau
            return {
                type: 'NETWORK_ERROR',
                message: 'Erreur de connexion. Vérifiez votre connexion internet.'
            };
        }

        // Erreur imprévue
        return {
            type: 'UNKNOWN_ERROR',
            message: error.message || 'Une erreur inattendue est survenue'
        };
    }

    logError(error) {
        // On pourrait implémenter ici la logique pour envoyer les erreurs 
        // vers un service de monitoring comme Sentry
        console.error('Error:', {
            type: error.type,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

export const errorService = new ErrorService();