import { useCallback, useRef, useEffect } from 'react';
import { webSocketService } from '../services/websocket.service';

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

export const useLogger = (options = {}) => {
    const {
        namespace = 'app',
        level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG,
        maxLogs = 1000,
        persistence = true,
        remote = false
    } = options;

    const logs = useRef([]);
    const enabled = useRef(true);

    // Formater un message de log
    const formatLogMessage = useCallback((level, message, data = null) => {
        return {
            timestamp: new Date().toISOString(),
            namespace,
            level,
            message,
            data,
            sessionId: localStorage.getItem('sessionId'),
            userAgent: navigator.userAgent
        };
    }, [namespace]);

    // Sauvegarder les logs localement
    const persistLogs = useCallback(() => {
        if (!persistence) return;

        try {
            localStorage.setItem(`logs_${namespace}`, JSON.stringify(logs.current));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des logs:', error);
        }
    }, [namespace, persistence]);

    // Envoyer les logs au serveur
    const sendRemoteLogs = useCallback((logEntry) => {
        if (!remote) return;

        try {
            webSocketService.sendMessage('LOGS', logEntry);
        } catch (error) {
            console.error('Erreur lors de l\'envoi des logs au serveur:', error);
        }
    }, [remote]);

    // Ajouter un log
    const addLog = useCallback((levelName, message, data = null) => {
        if (!enabled.current) return;

        const logLevel = LOG_LEVELS[levelName];
        if (logLevel < level) return;

        const logEntry = formatLogMessage(levelName, message, data);

        // Ajouter le log à la liste
        logs.current = [logEntry, ...logs.current].slice(0, maxLogs);

        // Persister les logs
        persistLogs();

        // Envoyer au serveur si nécessaire
        sendRemoteLogs(logEntry);

        return logEntry;
    }, [level, maxLogs, formatLogMessage, persistLogs, sendRemoteLogs]);

    // Fonctions de log par niveau
    const debug = useCallback((message, data) => {
        return addLog('DEBUG', message, data);
    }, [addLog]);

    const info = useCallback((message, data) => {
        return addLog('INFO', message, data);
    }, [addLog]);

    const warn = useCallback((message, data) => {
        return addLog('WARN', message, data);
    }, [addLog]);

    const error = useCallback((message, data) => {
        return addLog('ERROR', message, data);
    }, [addLog]);

    // Logger les erreurs non gérées
    useEffect(() => {
        if (!enabled.current) return;

        const handleError = (event) => {
            error('Erreur non gérée:', {
                message: event.error?.message || 'Erreur inconnue',
                stack: event.error?.stack,
                type: event.type,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        };

        const handleUnhandledRejection = (event) => {
            error('Promesse rejetée non gérée:', {
                message: event.reason?.message || 'Erreur inconnue',
                stack: event.reason?.stack,
                type: 'unhandledRejection'
            });
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, [error]);

    // Charger les logs persistés au démarrage
    useEffect(() => {
        if (!persistence) return;

        try {
            const savedLogs = localStorage.getItem(`logs_${namespace}`);
            if (savedLogs) {
                logs.current = JSON.parse(savedLogs);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des logs:', error);
        }
    }, [namespace, persistence]);

    // Obtenir tous les logs
    const getLogs = useCallback((filter = {}) => {
        let filtered = [...logs.current];

        if (filter.level) {
            filtered = filtered.filter(log => 
                LOG_LEVELS[log.level] >= LOG_LEVELS[filter.level]
            );
        }

        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filtered = filtered.filter(log =>
                log.message.toLowerCase().includes(searchTerm) ||
                JSON.stringify(log.data).toLowerCase().includes(searchTerm)
            );
        }

        if (filter.dateRange) {
            filtered = filtered.filter(log => {
                const timestamp = new Date(log.timestamp);
                return timestamp >= filter.dateRange[0] && 
                       timestamp <= filter.dateRange[1];
            });
        }

        return filtered;
    }, []);

    // Nettoyer les logs
    const clearLogs = useCallback(() => {
        logs.current = [];
        if (persistence) {
            localStorage.removeItem(`logs_${namespace}`);
        }
    }, [namespace, persistence]);

    // Activer/désactiver le logger
    const setEnabled = useCallback((state) => {
        enabled.current = state;
    }, []);

    return {
        debug,
        info,
        warn,
        error,
        getLogs,
        clearLogs,
        setEnabled
    };
};