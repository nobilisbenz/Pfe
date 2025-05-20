class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
    }

    set(key, value, ttl = this.defaultTTL) {
        const item = {
            value,
            timestamp: Date.now(),
            ttl
        };
        this.cache.set(key, item);
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > item.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        return this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }

    // Méthode pour récupérer une donnée du cache ou la fetcher si elle n'existe pas
    async getOrFetch(key, fetchFn, ttl = this.defaultTTL) {
        const cachedValue = this.get(key);
        if (cachedValue) return cachedValue;

        const value = await fetchFn();
        this.set(key, value, ttl);
        return value;
    }
}

export const cacheService = new CacheService();