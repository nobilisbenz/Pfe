import { useState, useCallback, useEffect } from 'react';
import { useLogger } from './useLogger';
import { useAuth } from './useAuth';

export const usePushNotifications = (options = {}) => {
    const {
        vapidPublicKey,
        notificationClickHandler,
        serviceWorkerPath = '/service-worker.js'
    } = options;

    const [permission, setPermission] = useState(Notification.permission);
    const [subscription, setSubscription] = useState(null);
    const [serviceWorker, setServiceWorker] = useState(null);
    const [isSupported, setIsSupported] = useState(false);
    const [error, setError] = useState(null);

    const logger = useLogger({ namespace: 'push-notifications' });
    const { user } = useAuth();

    // Vérifier le support des notifications
    useEffect(() => {
        const checkSupport = () => {
            const supported = 'Notification' in window && 
                            'serviceWorker' in navigator && 
                            'PushManager' in window;
            setIsSupported(supported);

            if (!supported) {
                setError('Les notifications push ne sont pas supportées par ce navigateur');
            }
        };

        checkSupport();
    }, []);

    // Convertir la clé VAPID en Uint8Array
    const urlBase64ToUint8Array = useCallback((base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }, []);

    // Enregistrer le service worker
    const registerServiceWorker = useCallback(async () => {
        try {
            const registration = await navigator.serviceWorker.register(serviceWorkerPath);
            setServiceWorker(registration);
            logger.info('Service Worker enregistré avec succès');
            return registration;
        } catch (error) {
            logger.error('Erreur lors de l\'enregistrement du Service Worker:', error);
            setError(error.message);
            throw error;
        }
    }, [serviceWorkerPath, logger]);

    // Demander la permission pour les notifications
    const requestPermission = useCallback(async () => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            logger.info('Permission des notifications:', result);
            return result === 'granted';
        } catch (error) {
            logger.error('Erreur lors de la demande de permission:', error);
            setError(error.message);
            throw error;
        }
    }, [logger]);

    // S'abonner aux notifications push
    const subscribe = useCallback(async () => {
        try {
            if (!isSupported) {
                throw new Error('Les notifications push ne sont pas supportées');
            }

            if (permission !== 'granted') {
                const granted = await requestPermission();
                if (!granted) {
                    throw new Error('Permission refusée pour les notifications');
                }
            }

            let swRegistration = serviceWorker;
            if (!swRegistration) {
                swRegistration = await registerServiceWorker();
            }

            // Vérifier si déjà abonné
            const existingSubscription = await swRegistration.pushManager.getSubscription();
            if (existingSubscription) {
                setSubscription(existingSubscription);
                return existingSubscription;
            }

            // Créer un nouvel abonnement
            const subscription = await swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            });

            setSubscription(subscription);
            logger.info('Abonnement aux notifications réussi');

            // Enregistrer l'abonnement sur le serveur
            // Cette partie dépend de votre implémentation backend
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription,
                    userId: user?._id
                }),
            });

            return subscription;
        } catch (error) {
            logger.error('Erreur lors de l\'abonnement aux notifications:', error);
            setError(error.message);
            throw error;
        }
    }, [
        isSupported,
        permission,
        serviceWorker,
        vapidPublicKey,
        registerServiceWorker,
        requestPermission,
        urlBase64ToUint8Array,
        user,
        logger
    ]);

    // Se désabonner des notifications push
    const unsubscribe = useCallback(async () => {
        try {
            if (!subscription) return;

            await subscription.unsubscribe();
            setSubscription(null);
            logger.info('Désabonnement des notifications réussi');

            // Informer le serveur
            await fetch('/api/push/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subscription,
                    userId: user?._id
                }),
            });
        } catch (error) {
            logger.error('Erreur lors du désabonnement:', error);
            setError(error.message);
            throw error;
        }
    }, [subscription, user, logger]);

    // Gérer les clics sur les notifications
    useEffect(() => {
        if (!serviceWorker || !notificationClickHandler) return;

        const handleNotificationClick = (event) => {
            event.notification.close();
            notificationClickHandler(event.notification.data);
        };

        navigator.serviceWorker.addEventListener('notificationclick', handleNotificationClick);

        return () => {
            navigator.serviceWorker.removeEventListener('notificationclick', handleNotificationClick);
        };
    }, [serviceWorker, notificationClickHandler]);

    // Initialisation au montage
    useEffect(() => {
        if (isSupported && !serviceWorker) {
            registerServiceWorker().catch(console.error);
        }
    }, [isSupported, serviceWorker, registerServiceWorker]);

    return {
        isSupported,
        permission,
        subscription,
        error,
        subscribe,
        unsubscribe,
        requestPermission
    };
};