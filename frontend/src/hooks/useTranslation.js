import { useCallback, useState, useEffect } from 'react';
import { cacheService } from '../services/cache.service';

const DEFAULT_LANGUAGE = 'fr';
const CACHE_KEY = 'translations';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures

export const useTranslation = (namespace = 'common') => {
    const [translations, setTranslations] = useState({});
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || DEFAULT_LANGUAGE;
    });
    const [loading, setLoading] = useState(true);

    // Charger les traductions
    const loadTranslations = useCallback(async (lang, ns) => {
        const cacheKey = `${CACHE_KEY}-${lang}-${ns}`;
        
        // Vérifier le cache
        const cached = cacheService.get(cacheKey);
        if (cached) {
            setTranslations(cached);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/locales/${lang}/${ns}.json`);
            const data = await response.json();
            
            // Mettre en cache
            cacheService.set(cacheKey, data, CACHE_TTL);
            
            setTranslations(data);
        } catch (error) {
            console.error(`Erreur lors du chargement des traductions (${lang}/${ns}):`, error);
            // Fallback sur les traductions en cache si disponibles
            const fallback = cacheService.get(cacheKey);
            if (fallback) {
                setTranslations(fallback);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les traductions au montage et lors du changement de langue
    useEffect(() => {
        loadTranslations(language, namespace);
    }, [language, namespace, loadTranslations]);

    // Fonction de traduction
    const t = useCallback((key, params = {}) => {
        const keys = key.split('.');
        let value = translations;

        for (const k of keys) {
            if (value?.[k] === undefined) {
                console.warn(`Clé de traduction manquante: ${key}`);
                return key;
            }
            value = value[k];
        }

        if (typeof value === 'string') {
            return Object.entries(params).reduce((acc, [param, val]) => {
                return acc.replace(new RegExp(`{{${param}}}`, 'g'), val);
            }, value);
        }

        return key;
    }, [translations]);

    // Changer la langue
    const changeLanguage = useCallback(async (newLanguage) => {
        localStorage.setItem('language', newLanguage);
        setLanguage(newLanguage);
        await loadTranslations(newLanguage, namespace);
        document.documentElement.lang = newLanguage;
        // Émettre un événement pour que les autres composants puissent réagir
        window.dispatchEvent(new Event('languagechange'));
    }, [namespace, loadTranslations]);

    // Formater une date selon la locale
    const formatDate = useCallback((date, options = {}) => {
        return new Date(date).toLocaleDateString(language, options);
    }, [language]);

    // Formater un nombre selon la locale
    const formatNumber = useCallback((number, options = {}) => {
        return new Intl.NumberFormat(language, options).format(number);
    }, [language]);

    // Formater une devise selon la locale
    const formatCurrency = useCallback((amount, currency = 'DZD') => {
        return new Intl.NumberFormat(language, {
            style: 'currency',
            currency
        }).format(amount);
    }, [language]);

    return {
        t,
        language,
        changeLanguage,
        formatDate,
        formatNumber,
        formatCurrency,
        loading,
        isRTL: ['ar', 'he', 'fa'].includes(language)
    };
};