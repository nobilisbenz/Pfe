import { useState, useCallback, useRef, useEffect } from 'react';
import { useLogger } from './useLogger';

const ASYNC_STATUS = {
    IDLE: 'idle',
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error'
};

export const useAsync = (options = {}) => {
    const {
        initialStatus = ASYNC_STATUS.IDLE,
        retryCount = 3,
        retryDelay = 1000,
        onSuccess,
        onError
    } = options;

    const logger = useLogger({ namespace: 'async' });
    const [status, setStatus] = useState(initialStatus);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const mountedRef = useRef(true);
    const retryCountRef = useRef(0);
    const abortControllerRef = useRef(null);

    const reset = useCallback(() => {
        setStatus(ASYNC_STATUS.IDLE);
        setError(null);
        setData(null);
        retryCountRef.current = 0;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const execute = useCallback(async (asyncFunction, ...args) => {
        if (!asyncFunction) return;

        try {
            setStatus(ASYNC_STATUS.PENDING);
            setError(null);

            // Create new AbortController for this execution
            abortControllerRef.current = new AbortController();
            const signal = abortControllerRef.current.signal;

            const executeWithRetry = async (retryAttempt) => {
                try {
                    const result = await asyncFunction(...args, { signal });
                    
                    if (mountedRef.current) {
                        setData(result);
                        setStatus(ASYNC_STATUS.SUCCESS);
                        if (onSuccess) {
                            onSuccess(result);
                        }
                    }
                    
                    return result;
                } catch (error) {
                    // Don't retry if the operation was aborted
                    if (error.name === 'AbortError') {
                        throw error;
                    }

                    if (retryAttempt < retryCount) {
                        logger.warn(`Retry attempt ${retryAttempt + 1} of ${retryCount}`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                        return executeWithRetry(retryAttempt + 1);
                    }
                    
                    throw error;
                }
            };

            return await executeWithRetry(0);
        } catch (error) {
            if (mountedRef.current) {
                setError(error);
                setStatus(ASYNC_STATUS.ERROR);
                if (onError) {
                    onError(error);
                }
                logger.error('Async operation failed:', error);
            }
            throw error;
        }
    }, [retryCount, retryDelay, onSuccess, onError, logger]);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // Cleanup on unmount
    const cleanup = useCallback(() => {
        mountedRef.current = false;
        cancel();
    }, [cancel]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        execute,
        status,
        data,
        error,
        reset,
        cancel,
        cleanup,
        isIdle: status === ASYNC_STATUS.IDLE,
        isPending: status === ASYNC_STATUS.PENDING,
        isSuccess: status === ASYNC_STATUS.SUCCESS,
        isError: status === ASYNC_STATUS.ERROR
    };
};