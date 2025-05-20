import { useEffect, useCallback, useRef } from 'react';
import { useLogger } from './useLogger';

export const usePerformanceMonitor = (options = {}) => {
    const {
        sampleRate = 0.1, // 10% des utilisateurs
        logThreshold = 1000, // Log les performances > 1s
        metricsEndpoint = '/api/metrics',
        enableResourceTiming = true,
        enableUserTiming = true,
        enableMemoryStats = true,
        enableNetworkInfo = true
    } = options;

    const logger = useLogger({ namespace: 'performance' });
    const metricsBuffer = useRef([]);
    const markTimings = useRef({});

    // Déterminer si cet utilisateur fait partie de l'échantillon
    const shouldSample = useRef(Math.random() < sampleRate);

    // Collecter les métriques de ressources
    const collectResourceMetrics = useCallback(() => {
        if (!enableResourceTiming) return [];

        const resources = performance.getEntriesByType('resource');
        return resources.map(resource => ({
            name: resource.name,
            type: resource.initiatorType,
            duration: resource.duration,
            size: resource.transferSize,
            protocol: resource.nextHopProtocol,
            timing: {
                dns: resource.domainLookupEnd - resource.domainLookupStart,
                tcp: resource.connectEnd - resource.connectStart,
                ttfb: resource.responseStart - resource.requestStart,
                download: resource.responseEnd - resource.responseStart
            }
        }));
    }, [enableResourceTiming]);

    // Collecter les métriques de mémoire
    const collectMemoryStats = useCallback(() => {
        if (!enableMemoryStats) return null;

        const memory = performance?.memory;
        if (!memory) return null;

        return {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
    }, [enableMemoryStats]);

    // Collecter les informations réseau
    const collectNetworkInfo = useCallback(() => {
        if (!enableNetworkInfo) return null;
        
        const connection = navigator.connection || 
                          navigator.mozConnection || 
                          navigator.webkitConnection;
        
        if (!connection) return null;

        return {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
        };
    }, [enableNetworkInfo]);

    // Mesurer le temps entre deux points
    const mark = useCallback((name) => {
        if (!enableUserTiming || !shouldSample.current) return;

        markTimings.current[name] = performance.now();
        performance.mark(name);
    }, [enableUserTiming]);

    // Mesurer la durée entre deux marques
    const measure = useCallback((name, startMark, endMark) => {
        if (!enableUserTiming || !shouldSample.current) return;

        try {
            performance.measure(name, startMark, endMark);
            const duration = performance.getEntriesByName(name, 'measure')[0].duration;

            if (duration > logThreshold) {
                logger.warn(`Performance: ${name} took ${duration}ms`);
            }

            return duration;
        } catch (error) {
            logger.error('Error measuring performance:', error);
            return null;
        }
    }, [enableUserTiming, logThreshold, logger]);

    // Collecter toutes les métriques
    const collectMetrics = useCallback(() => {
        const metrics = {
            timestamp: Date.now(),
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            timing: {
                // Métriques Web Vitals
                fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
                lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
                fid: performance.getEntriesByName('first-input-delay')[0]?.duration,
                cls: performance.getEntriesByName('cumulative-layout-shift')[0]?.value,
                // Métriques de navigation
                dns: performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
                tcp: performance.timing.connectEnd - performance.timing.connectStart,
                ttfb: performance.timing.responseStart - performance.timing.requestStart,
                domLoad: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                windowLoad: performance.timing.loadEventEnd - performance.timing.navigationStart
            },
            resources: collectResourceMetrics(),
            memory: collectMemoryStats(),
            network: collectNetworkInfo(),
            marks: Object.entries(markTimings.current).reduce((acc, [key, value]) => {
                acc[key] = performance.now() - value;
                return acc;
            }, {})
        };

        return metrics;
    }, [collectResourceMetrics, collectMemoryStats, collectNetworkInfo]);

    // Envoyer les métriques au serveur
    const sendMetrics = useCallback(async () => {
        if (!shouldSample.current || metricsBuffer.current.length === 0) return;

        try {
            const metrics = [...metricsBuffer.current];
            metricsBuffer.current = [];

            await fetch(metricsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metrics),
                // Utiliser keepalive pour s'assurer que la requête est envoyée
                keepalive: true
            });
        } catch (error) {
            logger.error('Error sending metrics:', error);
            // Remettre les métriques dans le buffer en cas d'échec
            metricsBuffer.current = [...metricsBuffer.current, ...metrics];
        }
    }, [metricsEndpoint, logger]);

    // Ajouter des métriques au buffer
    const addMetrics = useCallback((metrics) => {
        if (!shouldSample.current) return;
        metricsBuffer.current.push(metrics);
    }, []);

    // Observer les métriques Web Vitals
    useEffect(() => {
        if (!shouldSample.current) return;

        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                const metric = {
                    name: entry.name,
                    value: entry.value,
                    timestamp: entry.startTime,
                    type: entry.entryType
                };
                addMetrics(metric);
            });
        });

        // Observer les différentes métriques
        observer.observe({ 
            entryTypes: [
                'first-input',
                'layout-shift',
                'largest-contentful-paint',
                'paint'
            ] 
        });

        return () => observer.disconnect();
    }, [addMetrics]);

    // Envoyer les métriques périodiquement et avant la fermeture de la page
    useEffect(() => {
        if (!shouldSample.current) return;

        const interval = setInterval(sendMetrics, 60000); // Toutes les minutes

        const handleBeforeUnload = () => {
            const finalMetrics = collectMetrics();
            addMetrics(finalMetrics);
            sendMetrics();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [sendMetrics, collectMetrics, addMetrics]);

    return {
        mark,
        measure,
        addMetrics,
        collectMetrics
    };
};