import { useEffect, useCallback } from 'react';
import { webSocketService } from '../services/websocket.service';

export const useWebSocket = (eventType, callback) => {
    // Mémoriser le callback pour éviter des re-souscriptions inutiles
    const memoizedCallback = useCallback((data) => {
        callback(data);
    }, [callback]);

    useEffect(() => {
        // S'abonner à l'événement
        const unsubscribe = webSocketService.subscribe(eventType, memoizedCallback);

        // Se désabonner lors du démontage du composant
        return () => {
            unsubscribe();
        };
    }, [eventType, memoizedCallback]);

    // Retourner une fonction pour envoyer des messages
    const sendMessage = useCallback((payload) => {
        webSocketService.sendMessage(eventType, payload);
    }, [eventType]);

    return sendMessage;
};