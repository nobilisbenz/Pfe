import { useState, useCallback, useRef, useEffect } from 'react';
import { useAsync } from './useAsync';
import { useLogger } from './useLogger';

const SYNC_STATUS = {
    IDLE: 'idle',
    SYNCING: 'syncing',
    ERROR: 'error',
    SUCCESS: 'success'
};

export const useOfflineSync = (options = {}) => {
    const {
        storageKey,
        onSync,
        onSyncError,
        syncInterval = 5000,
        maxRetries = 3,
        conflictResolution = 'server-wins'
    } = options;

    const logger = useLogger({ namespace: 'offline-sync' });
    const [syncStatus, setSyncStatus] = useState(SYNC_STATUS.IDLE);
    const pendingChanges = useRef(new Map());
    const syncTimeoutRef = useRef(null);
    const isOnline = useRef(navigator.onLine);

    const async = useAsync({
        retryCount: maxRetries,
        onError: onSyncError
    });

    // Charger les changements en attente du stockage local
    const loadPendingChanges = useCallback(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                pendingChanges.current = new Map(Object.entries(parsed));
            }
        } catch (error) {
            logger.error('Error loading pending changes:', error);
        }
    }, [storageKey, logger]);

    // Sauvegarder les changements en attente dans le stockage local
    const savePendingChanges = useCallback(() => {
        try {
            const obj = Object.fromEntries(pendingChanges.current);
            localStorage.setItem(storageKey, JSON.stringify(obj));
        } catch (error) {
            logger.error('Error saving pending changes:', error);
        }
    }, [storageKey, logger]);

    // Ajouter un changement à synchroniser
    const queueChange = useCallback((key, data) => {
        pendingChanges.current.set(key, {
            data,
            timestamp: Date.now()
        });
        savePendingChanges();
        
        // Déclencher une synchronisation immédiate si en ligne
        if (isOnline.current) {
            synchronize();
        }
    }, [savePendingChanges]);

    // Résoudre les conflits
    const resolveConflict = useCallback((localData, serverData) => {
        switch (conflictResolution) {
            case 'server-wins':
                return serverData;
            case 'client-wins':
                return localData;
            case 'latest-wins':
                return localData.timestamp > serverData.timestamp ? localData : serverData;
            default:
                return serverData;
        }
    }, [conflictResolution]);

    // Synchroniser les changements avec le serveur
    const synchronize = useCallback(async () => {
        if (syncStatus === SYNC_STATUS.SYNCING || !isOnline.current || pendingChanges.current.size === 0) {
            return;
        }

        setSyncStatus(SYNC_STATUS.SYNCING);

        try {
            const changes = Array.from(pendingChanges.current.entries());
            
            for (const [key, change] of changes) {
                try {
                    // Appeler la fonction de synchronisation fournie
                    const serverData = await onSync(key, change.data);
                    
                    // Résoudre les conflits si nécessaire
                    const resolvedData = resolveConflict(change, serverData);
                    
                    // Si la synchronisation réussit, supprimer le changement en attente
                    pendingChanges.current.delete(key);
                } catch (error) {
                    logger.error('Error syncing change:', { key, error });
                    // Garder le changement pour réessayer plus tard
                }
            }

            savePendingChanges();
            setSyncStatus(SYNC_STATUS.SUCCESS);
        } catch (error) {
            setSyncStatus(SYNC_STATUS.ERROR);
            throw error;
        }
    }, [syncStatus, onSync, savePendingChanges, resolveConflict, logger]);

    // Gérer les changements de connectivité
    const handleOnline = useCallback(() => {
        isOnline.current = true;
        synchronize();
    }, [synchronize]);

    const handleOffline = useCallback(() => {
        isOnline.current = false;
        setSyncStatus(SYNC_STATUS.IDLE);
    }, []);

    // Configurer les écouteurs d'événements et charger les données initiales
    useEffect(() => {
        loadPendingChanges();
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [loadPendingChanges, handleOnline, handleOffline]);

    // Configurer la synchronisation périodique
    useEffect(() => {
        if (syncInterval > 0) {
            syncTimeoutRef.current = setInterval(synchronize, syncInterval);
        }

        return () => {
            if (syncTimeoutRef.current) {
                clearInterval(syncTimeoutRef.current);
            }
        };
    }, [synchronize, syncInterval]);

    return {
        queueChange,
        synchronize: async.execute,
        syncStatus,
        pendingChangesCount: pendingChanges.current.size,
        isOnline: isOnline.current,
        isSyncing: syncStatus === SYNC_STATUS.SYNCING,
        hasError: syncStatus === SYNC_STATUS.ERROR,
        clear: useCallback(() => {
            pendingChanges.current.clear();
            savePendingChanges();
        }, [savePendingChanges])
    };
};