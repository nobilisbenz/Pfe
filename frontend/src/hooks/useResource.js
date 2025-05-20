import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '../services/cache.service';

export const useResource = (options = {}) => {
    const {
        preload = false,
        cacheKey = null,
        ttl = 5 * 60 * 1000, // 5 minutes par défaut
        threshold = 0.5 // Seuil pour le lazy loading
    } = options;

    const [resources, setResources] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const observerRef = useRef(null);

    // Fonction pour charger une ressource
    const loadResource = useCallback(async (url, type = 'image') => {
        if (resources.has(url)) {
            return resources.get(url);
        }

        // Vérifier le cache
        if (cacheKey) {
            const cached = cacheService.get(`${cacheKey}-${url}`);
            if (cached) {
                setResources(prev => new Map(prev).set(url, cached));
                return cached;
            }
        }

        setLoading(true);
        setError(null);

        try {
            let resource;
            switch (type) {
                case 'image':
                    resource = await new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = url;
                    });
                    break;
                case 'json':
                    const response = await fetch(url);
                    resource = await response.json();
                    break;
                case 'script':
                    resource = await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.onload = () => resolve(script);
                        script.onerror = reject;
                        script.src = url;
                        document.head.appendChild(script);
                    });
                    break;
                default:
                    throw new Error(`Type de ressource non supporté: ${type}`);
            }

            // Mettre en cache
            if (cacheKey) {
                cacheService.set(`${cacheKey}-${url}`, resource, ttl);
            }

            setResources(prev => new Map(prev).set(url, resource));
            return resource;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [resources, cacheKey, ttl]);

    // Configuration de l'Intersection Observer pour le lazy loading
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const url = entry.target.dataset.src;
                        if (url) {
                            loadResource(url)
                                .then(() => {
                                    entry.target.src = url;
                                    entry.target.removeAttribute('data-src');
                                    observerRef.current.unobserve(entry.target);
                                })
                                .catch(console.error);
                        }
                    }
                });
            },
            { threshold }
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadResource, threshold]);

    // Fonction pour précharger des ressources
    const preloadResources = useCallback(async (urls, type = 'image') => {
        if (!Array.isArray(urls)) urls = [urls];
        return Promise.all(urls.map(url => loadResource(url, type)));
    }, [loadResource]);

    // Précharger les ressources si l'option est activée
    useEffect(() => {
        if (preload && Array.isArray(preload)) {
            preloadResources(preload).catch(console.error);
        }
    }, [preload, preloadResources]);

    // Composant pour le lazy loading d'images
    const LazyImage = useCallback(({ src, alt, className, ...props }) => {
        const imgRef = useRef(null);

        useEffect(() => {
            if (imgRef.current && observerRef.current) {
                observerRef.current.observe(imgRef.current);
            }

            return () => {
                if (imgRef.current && observerRef.current) {
                    observerRef.current.unobserve(imgRef.current);
                }
            };
        }, []);

        return (
            <img
                ref={imgRef}
                data-src={src}
                alt={alt}
                className={`opacity-0 transition-opacity duration-300 ${className}`}
                onLoad={(e) => e.target.classList.remove('opacity-0')}
                {...props}
            />
        );
    }, []);

    return {
        loadResource,
        preloadResources,
        LazyImage,
        resources,
        loading,
        error
    };
};