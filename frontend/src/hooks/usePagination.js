import { useState, useCallback, useMemo } from 'react';
import { useDataFetching } from './useDataFetching';

export const usePagination = (fetchFn, options = {}) => {
    const {
        initialPage = 1,
        pageSize = 10,
        cacheKey = null,
        initialFilters = {},
        initialSort = { field: null, direction: 'asc' }
    } = options;

    const [page, setPage] = useState(initialPage);
    const [filters, setFilters] = useState(initialFilters);
    const [sort, setSort] = useState(initialSort);

    const queryParams = useMemo(() => ({
        page,
        pageSize,
        ...filters,
        sortField: sort.field,
        sortDirection: sort.direction
    }), [page, pageSize, filters, sort]);

    const {
        data,
        loading,
        error,
        refetch
    } = useDataFetching(
        () => fetchFn(queryParams),
        cacheKey ? `${cacheKey}-${JSON.stringify(queryParams)}` : null
    );

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
        setPage(1); // Réinitialiser à la première page lors du filtrage
    }, []);

    const handleSortChange = useCallback((field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
        setPage(1);
    }, [initialFilters]);

    const refresh = useCallback(() => {
        refetch(queryParams);
    }, [refetch, queryParams]);

    return {
        data: data?.data || [],
        totalItems: data?.total || 0,
        totalPages: data?.totalPages || 0,
        currentPage: page,
        pageSize,
        loading,
        error,
        filters,
        sort,
        handlePageChange,
        handleFilterChange,
        handleSortChange,
        clearFilters,
        refresh
    };
};