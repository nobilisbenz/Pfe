import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notification.service';
import { useWebSocket } from './useWebSocket';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Charger les notifications initiales
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const response = await notificationService.getNotifications();
                setNotifications(response.data || []);
                const unreadResponse = await notificationService.getUnreadCount();
                setUnreadCount(unreadResponse.data || 0);
            } catch (error) {
                console.error('Erreur lors du chargement des notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, []);

    // Gérer les nouvelles notifications via WebSocket
    const handleNewNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    useWebSocket('NOTIFICATION', handleNewNotification);

    // Marquer une notification comme lue
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Erreur lors du marquage de la notification:', error);
        }
    }, []);

    // Marquer toutes les notifications comme lues
    const markAllAsRead = useCallback(async () => {
        try {
            await Promise.all(
                notifications
                    .filter(n => !n.read)
                    .map(n => notificationService.markAsRead(n.id))
            );
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Erreur lors du marquage de toutes les notifications:', error);
        }
    }, [notifications]);

    // Supprimer une notification
    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
            );
            const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la notification:', error);
        }
    }, [notifications]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };
};