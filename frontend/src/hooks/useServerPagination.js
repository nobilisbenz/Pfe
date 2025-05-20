import { useState, useCallback, useEffect, useRef } from 'react';
import { cacheService } from '../services/cache.service';
import { useApi } from './useApi';

export const useServerPagination = (options = {}) => {
    const {
        fetchFunction,
        cacheKey,
        cacheTTL = 5 * 60 * 1000, // 5 minutes
        defaultPageSize = 10,
        defaultFilters = {},
        defaultSort = { field: 'createdAt', direction: 'desc' }
    } = options;

    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [filters, setFilters] = useState(defaultFilters);
    const [sort, setSort] = useState(defaultSort);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const previousRequestRef = useRef(null);
    const cachedPagesRef = useRef(new Set());
    const api = useApi();

    // Générer une clé de cache unique pour la page courante
    const getCurrentCacheKey = useCallback(() => {
        if (!cacheKey) return null;
        return `${cacheKey}_page_${currentPage}_size_${pageSize}_${JSON.stringify(filters)}_${JSON.stringify(sort)}`;
    }, [cacheKey, currentPage, pageSize, filters, sort]);

    // Charger les données depuis le cache ou le serveur
    const loadData = useCallback(async (page = currentPage) => {
        const currentCacheKey = getCurrentCacheKey();
        setError(null);

        // Annuler la requête précédente si elle existe
        if (previousRequestRef.current) {
            previousRequestRef.current.abort();
        }

        // Créer un nouveau AbortController
        const abortController = new AbortController();
        previousRequestRef.current = abortController;

        try {
            setIsLoading(true);

            // Vérifier le cache
            if (currentCacheKey) {
                const cached = await cacheService.get(currentCacheKey);
                if (cached) {
                    setData(cached.data);
                    setTotalItems(cached.total);
                    return;
                }
            }

            // Préparer les paramètres de requête
            const params = {
                page,
                limit: pageSize,
                ...filters,
                sort: `${sort.field},${sort.direction}`
            };

            // Effectuer la requête
            const response = await fetchFunction(params, {
                signal: abortController.signal
            });

            // Mettre à jour les données
            setData(response.data);
            setTotalItems(response.total);

            // Mettre en cache
            if (currentCacheKey) {
                await cacheService.set(currentCacheKey, {
                    data: response.data,
                    total: response.total
                }, cacheTTL);
                cachedPagesRef.current.add(page);
            }
        } catch (err) {
            if (err.name === 'AbortError') return;
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [
        currentPage,
        pageSize,
        filters,
        sort,
        fetchFunction,
        getCurrentCacheKey,
        cacheTTL
    ]);

    // Précharger la page suivante
    const preloadNextPage = useCallback(async () => {
        const nextPage = currentPage + 1;
        const totalPages = Math.ceil(totalItems / pageSize);

        if (nextPage <= totalPages && !cachedPagesRef.current.has(nextPage)) {
            try {
                const params = {
                    page: nextPage,
                    limit: pageSize,
                    ...filters,
                    sort: `${sort.field},${sort.direction}`
                };

                const response = await fetchFunction(params);
                const nextCacheKey = `${cacheKey}_page_${nextPage}_size_${pageSize}_${JSON.stringify(filters)}_${JSON.stringify(sort)}`;

                await cacheService.set(nextCacheKey, {
                    data: response.data,
                    total: response.total
                }, cacheTTL);

                cachedPagesRef.current.add(nextPage);
            } catch (error) {
                console.error('Erreur lors du préchargement:', error);
            }
        }
    }, [
        currentPage,
        pageSize,
        totalItems,
        filters,
        sort,
        fetchFunction,
        cacheKey,
        cacheTTL
    ]);

    // Changer de page
    const goToPage = useCallback(async (page) => {
        setCurrentPage(page);
        await loadData(page);
    }, [loadData]);

    // Mettre à jour les filtres
    const updateFilters = useCallback(async (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
        setCurrentPage(1);
        cachedPagesRef.current.clear();
        await loadData(1);
    }, [loadData]);

    // Mettre à jour le tri
    const updateSort = useCallback(async (field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc'
                ? 'desc'
                : 'asc'
        }));
        setCurrentPage(1);
        cachedPagesRef.current.clear();
        await loadData(1);
    }, [loadData]);

    // Mettre à jour la taille de la page
    const updatePageSize = useCallback(async (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
        cachedPagesRef.current.clear();
        await loadData(1);
    }, [loadData]);

    // Rafraîchir les données
    const refresh = useCallback(async () => {
        cachedPagesRef.current.clear();
        await loadData(currentPage);
    }, [currentPage, loadData]);

    // Charger les données initiales
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Précharger la page suivante quand on est proche de la fin
    useEffect(() => {
        if (!isLoading) {
            preloadNextPage();
        }
    }, [isLoading, preloadNextPage]);

    return {
        data,
        totalItems,
        currentPage,
        pageSize,
        filters,
        sort,
        isLoading,
        error,
        goToPage,
        updateFilters,
        updateSort,
        updatePageSize,
        refresh,
        totalPages: Math.ceil(totalItems / pageSize)
    };
};