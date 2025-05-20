import { useState, useEffect, useCallback } from 'react';
import { cacheService } from '../services/cache.service';
import { errorService } from '../services/error.service';

export const useDataFetching = (fetchFn, cacheKey = null, ttl = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (params = null) => {
        setLoading(true);
        setError(null);

        try {
            let result;
            if (cacheKey) {
                result = await cacheService.getOrFetch(
                    cacheKey + (params ? JSON.stringify(params) : ''),
                    async () => await fetchFn(params),
                    ttl
                );
            } else {
                result = await fetchFn(params);
            }
            setData(result);
        } catch (err) {
            const handledError = errorService.handleError(err);
            errorService.logError(handledError);
            setError(handledError);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, cacheKey, ttl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const invalidateCache = useCallback(() => {
        if (cacheKey) {
            cacheService.delete(cacheKey);
        }
    }, [cacheKey]);

    const refetch = useCallback(async (params = null) => {
        invalidateCache();
        await fetchData(params);
    }, [fetchData, invalidateCache]);

    return {
        data,
        loading,
        error,
        refetch,
        invalidateCache
    };
};