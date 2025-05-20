import { useCallback } from 'react';
import { useDataFetching } from './useDataFetching';
import { notificationService } from '../services/notification.service';
import { useAuth } from './useAuth';

export const useActivity = () => {
    const { user } = useAuth();

    const {
        data: activities,
        loading,
        error,
        refetch
    } = useDataFetching(
        () => notificationService.getActivities(),
        'user-activities',
        5 * 60 * 1000 // Cache de 5 minutes
    );

    const logActivity = useCallback(async (activityData) => {
        try {
            const data = {
                ...activityData,
                userId: user?._id,
                timestamp: new Date().toISOString()
            };
            await notificationService.logActivity(data);
            refetch();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
            throw error;
        }
    }, [user, refetch]);

    const formatActivityMessage = useCallback((activity) => {
        const { type, details, entityType, entityName } = activity;
        
        const messageTemplates = {
            CREATE: `a créé ${entityType} "${entityName}"`,
            UPDATE: `a modifié ${entityType} "${entityName}"`,
            DELETE: `a supprimé ${entityType} "${entityName}"`,
            LOGIN: 's\'est connecté',
            LOGOUT: 's\'est déconnecté',
            EXAM_SUBMIT: `a soumis l'examen "${entityName}"`,
            GRADE_UPDATE: `a mis à jour les notes pour "${entityName}"`,
            PAYMENT: `a effectué un paiement pour "${entityName}"`
        };

        return `${activity.userName} ${messageTemplates[type] || activity.message}`;
    }, []);

    const filterActivities = useCallback((filters) => {
        if (!activities?.data) return [];

        return activities.data.filter(activity => {
            if (filters.type && activity.type !== filters.type) return false;
            if (filters.entityType && activity.entityType !== filters.entityType) return false;
            if (filters.userId && activity.userId !== filters.userId) return false;
            if (filters.dateRange) {
                const activityDate = new Date(activity.timestamp);
                if (activityDate < filters.dateRange.start || activityDate > filters.dateRange.end) {
                    return false;
                }
            }
            return true;
        });
    }, [activities]);

    const getActivityStats = useCallback(() => {
        if (!activities?.data) return null;

        return {
            total: activities.data.length,
            byType: activities.data.reduce((acc, activity) => {
                acc[activity.type] = (acc[activity.type] || 0) + 1;
                return acc;
            }, {}),
            byEntity: activities.data.reduce((acc, activity) => {
                acc[activity.entityType] = (acc[activity.entityType] || 0) + 1;
                return acc;
            }, {}),
            recentActivity: activities.data.slice(0, 5)
        };
    }, [activities]);

    return {
        activities: activities?.data || [],
        loading,
        error,
        logActivity,
        formatActivityMessage,
        filterActivities,
        getActivityStats,
        refresh: refetch
    };
};