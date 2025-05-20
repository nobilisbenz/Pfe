import { useCallback, useReducer, useRef } from 'react';
import { cacheService } from '../services/cache.service';
import { errorService } from '../services/error.service';
import { useAuth } from './useAuth';

const initialState = {
    data: null,
    loading: false,
    error: null,
    timestamp: null
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'REQUEST_START':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'REQUEST_SUCCESS':
            return {
                data: action.payload,
                loading: false,
                error: null,
                timestamp: Date.now()
            };
        case 'REQUEST_ERROR':
            return {
                ...state,
                loading: false,
                error: action.payload
            };
        case 'RESET':
            return initialState;
        default:
            return state;
    }
};

export const useApi = (config = {}) => {
    const {
        cacheKey = null,
        cacheTTL = 5 * 60 * 1000, // 5 minutes par défaut
        retryCount = 3,
        retryDelay = 1000,
        onError = null,
        onSuccess = null,
        withAuth = true
    } = config;

    const [state, dispatch] = useReducer(reducer, initialState);
    const { refreshUserProfile } = useAuth();
    const abortControllerRef = useRef(null);

    // Fonction pour effectuer une requête
    const request = useCallback(async (apiFunction, ...args) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        dispatch({ type: 'REQUEST_START' });

        // Vérifier le cache
        if (cacheKey) {
            const cached = cacheService.get(cacheKey);
            if (cached) {
                dispatch({ type: 'REQUEST_SUCCESS', payload: cached });
                return cached;
            }
        }

        let attempt = 0;
        while (attempt < retryCount) {
            try {
                const response = await apiFunction(...args, {
                    signal: abortControllerRef.current.signal
                });

                // Mettre en cache si nécessaire
                if (cacheKey) {
                    cacheService.set(cacheKey, response.data, cacheTTL);
                }

                dispatch({ type: 'REQUEST_SUCCESS', payload: response.data });

                // Rafraîchir le profil utilisateur si nécessaire
                if (withAuth && response.data?.user) {
                    await refreshUserProfile();
                }

                if (onSuccess) {
                    onSuccess(response.data);
                }

                return response.data;
            } catch (error) {
                // Ne pas réessayer si la requête a été annulée
                if (error.name === 'AbortError') {
                    throw error;
                }

                attempt++;
                
                // Si c'est la dernière tentative ou une erreur qui ne nécessite pas de réessai
                if (attempt === retryCount || !shouldRetry(error)) {
                    const handledError = errorService.handleError(error);
                    dispatch({ type: 'REQUEST_ERROR', payload: handledError });

                    if (onError) {
                        onError(handledError);
                    }

                    throw handledError;
                }

                // Attendre avant de réessayer
                await new Promise(resolve => 
                    setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
                );
            }
        }
    }, [cacheKey, cacheTTL, retryCount, retryDelay, onError, onSuccess, withAuth, refreshUserProfile]);

    // Vérifier si une erreur mérite une nouvelle tentative
    const shouldRetry = useCallback((error) => {
        // Ne pas réessayer pour les erreurs 4xx
        if (error.response?.status >= 400 && error.response?.status < 500) {
            return false;
        }

        // Réessayer pour les erreurs réseau et les erreurs 5xx
        return true;
    }, []);

    // Annuler la requête en cours
    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // Réinitialiser l'état
    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    // Invalider le cache
    const invalidateCache = useCallback(() => {
        if (cacheKey) {
            cacheService.delete(cacheKey);
        }
    }, [cacheKey]);

    // Nettoyer lors du démontage
    const cleanup = useCallback(() => {
        cancel();
        reset();
    }, [cancel, reset]);

    return {
        ...state,
        request,
        cancel,
        reset,
        invalidateCache,
        cleanup
    };
};