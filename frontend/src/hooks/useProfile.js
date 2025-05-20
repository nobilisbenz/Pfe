import { useCallback } from 'react';
import { useDataFetching } from './useDataFetching';
import { userService } from '../services/user.service';
import { useAuth } from './useAuth';
import { useWebSocket } from './useWebSocket';
import { useActivity } from './useActivity';

export const useProfile = (userId = null) => {
    const { user, isAdmin, userType, refreshUserProfile } = useAuth();
    const { logActivity } = useActivity();

    const {
        data: profileData,
        loading,
        error,
        refetch
    } = useDataFetching(
        () => {
            if (userId) {
                return userType === 'admin'
                    ? userService.getUserById(userId)
                    : Promise.reject(new Error('Non autorisé'));
            }
            return userType ? userService.getProfile() : null;
        },
        userId ? `user-profile-${userId}` : 'own-profile',
        5 * 60 * 1000 // Cache de 5 minutes
    );

    // Écouter les mises à jour en temps réel du profil
    useWebSocket('USER_UPDATE', (data) => {
        if ((userId && data.userId === userId) || (!userId && data.userId === user?._id)) {
            refetch();
        }
    });

    const updateProfile = useCallback(async (data) => {
        try {
            let response;
            if (userId && isAdmin) {
                response = await userService.adminUpdateUser(userId, data);
            } else {
                response = await userService.updateProfile(data);
                await refreshUserProfile();
            }

            await logActivity({
                type: 'UPDATE',
                entityType: 'profile',
                entityName: response.data.name,
                details: 'Mise à jour du profil'
            });

            refetch();
            return response;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            throw error;
        }
    }, [userId, isAdmin, refreshUserProfile, logActivity, refetch]);

    const updatePassword = useCallback(async (currentPassword, newPassword) => {
        try {
            const response = await userService.updatePassword(currentPassword, newPassword);
            
            await logActivity({
                type: 'UPDATE',
                entityType: 'password',
                entityName: user?.name,
                details: 'Modification du mot de passe'
            });

            return response;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du mot de passe:', error);
            throw error;
        }
    }, [user, logActivity]);

    const updateProfilePicture = useCallback(async (file) => {
        try {
            const response = await userService.updateProfilePicture(file);
            
            await logActivity({
                type: 'UPDATE',
                entityType: 'avatar',
                entityName: user?.name,
                details: 'Mise à jour de la photo de profil'
            });

            refetch();
            return response;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la photo de profil:', error);
            throw error;
        }
    }, [user, logActivity, refetch]);

    return {
        profile: profileData?.data,
        loading,
        error,
        updateProfile,
        updatePassword,
        updateProfilePicture,
        refetch
    };
};