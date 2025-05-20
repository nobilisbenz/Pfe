import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from '../utils/helpers';

export const useSearch = (options = {}) => {
    const {
        initialData = [],
        searchFields = [],
        sortOptions = {},
        filterOptions = {},
        debounceTime = 300,
        pagination = true,
        pageSize = 10
    } = options;

    const [data, setData] = useState(initialData);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [sortBy, setSortBy] = useState({ field: null, direction: 'asc' });
    const [page, setPage] = useState(1);

    // Fonction de recherche
    const search = useCallback((items, term) => {
        if (!term) return items;

        return items.filter(item =>
            searchFields.some(field => {
                const value = field.split('.').reduce((obj, key) => obj?.[key], item);
                if (value == null) return false;
                
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(term.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(term);
                }
                return false;
            })
        );
    }, [searchFields]);

    // Fonction de filtrage
    const filter = useCallback((items, activeFilters) => {
        return items.filter(item =>
            Object.entries(activeFilters).every(([field, value]) => {
                if (!value) return true;

                const filterConfig = filterOptions[field];
                if (!filterConfig) return true;

                const itemValue = field.split('.').reduce((obj, key) => obj?.[key], item);
                
                switch (filterConfig.type) {
                    case 'select':
                        return itemValue === value;
                    case 'multiSelect':
                        return value.includes(itemValue);
                    case 'range':
                        return itemValue >= value[0] && itemValue <= value[1];
                    case 'boolean':
                        return itemValue === value;
                    case 'date':
                        const itemDate = new Date(itemValue);
                        const filterDate = new Date(value);
                        return itemDate.toDateString() === filterDate.toDateString();
                    case 'dateRange':
                        const date = new Date(itemValue);
                        return date >= new Date(value[0]) && date <= new Date(value[1]);
                    case 'custom':
                        return filterConfig.predicate(itemValue, value, item);
                    default:
                        return true;
                }
            })
        );
    }, [filterOptions]);

    // Fonction de tri
    const sort = useCallback((items, { field, direction }) => {
        if (!field) return items;

        const sortConfig = sortOptions[field];
        if (!sortConfig) return items;

        return [...items].sort((a, b) => {
            const aValue = field.split('.').reduce((obj, key) => obj?.[key], a);
            const bValue = field.split('.').reduce((obj, key) => obj?.[key], b);

            if (sortConfig.type === 'string') {
                return direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            if (sortConfig.type === 'number') {
                return direction === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }
            if (sortConfig.type === 'date') {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                return direction === 'asc'
                    ? dateA - dateB
                    : dateB - dateA;
            }
            if (sortConfig.type === 'custom') {
                return sortConfig.compare(aValue, bValue, direction);
            }
            return 0;
        });
    }, [sortOptions]);

    // Appliquer la recherche, le filtrage et le tri
    const processedData = useMemo(() => {
        let result = [...data];
        
        // Appliquer la recherche
        if (searchTerm) {
            result = search(result, searchTerm);
        }

        // Appliquer les filtres
        if (Object.keys(filters).length > 0) {
            result = filter(result, filters);
        }

        // Appliquer le tri
        if (sortBy.field) {
            result = sort(result, sortBy);
        }

        return result;
    }, [data, searchTerm, filters, sortBy, search, filter, sort]);

    // Pagination
    const paginatedData = useMemo(() => {
        if (!pagination) return processedData;

        const start = (page - 1) * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, pagination, page, pageSize]);

    // Gestionnaire de recherche avec debounce
    const handleSearch = useMemo(
        () => debounce((term) => setSearchTerm(term), debounceTime),
        [debounceTime]
    );

    // Mettre à jour les filtres
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
        setPage(1);
    }, []);

    // Mettre à jour le tri
    const updateSort = useCallback((field) => {
        setSortBy(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc'
                ? 'desc'
                : 'asc'
        }));
    }, []);

    // Réinitialiser tous les paramètres
    const reset = useCallback(() => {
        setSearchTerm('');
        setFilters({});
        setSortBy({ field: null, direction: 'asc' });
        setPage(1);
    }, []);

    // Mettre à jour la page
    const updatePage = useCallback((newPage) => {
        setPage(newPage);
    }, []);

    // Stats
    const stats = useMemo(() => ({
        total: processedData.length,
        filtered: processedData.length,
        pages: pagination ? Math.ceil(processedData.length / pageSize) : 1
    }), [processedData.length, pagination, pageSize]);

    return {
        data: paginatedData,
        stats,
        searchTerm,
        filters,
        sortBy,
        page,
        handleSearch,
        updateFilters,
        updateSort,
        updatePage,
        reset
    };
};