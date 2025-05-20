import { useState, useEffect, useCallback } from 'react';
import { useLogger } from './useLogger';

const COLOR_SCHEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

const STORAGE_KEY = 'app_theme';

export const useTheme = (options = {}) => {
    const {
        defaultTheme = COLOR_SCHEMES.SYSTEM,
        storageKey = STORAGE_KEY,
        onChange = null,
        customThemes = {}
    } = options;

    const logger = useLogger({ namespace: 'theme' });
    const [currentTheme, setCurrentTheme] = useState(() => {
        // Récupérer le thème sauvegardé ou utiliser celui par défaut
        const saved = localStorage.getItem(storageKey);
        return saved || defaultTheme;
    });

    const [systemTheme, setSystemTheme] = useState(() => 
        window.matchMedia('(prefers-color-scheme: dark)').matches
            ? COLOR_SCHEMES.DARK
            : COLOR_SCHEMES.LIGHT
    );

    // Observer les changements de préférence système
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            const newSystemTheme = e.matches ? COLOR_SCHEMES.DARK : COLOR_SCHEMES.LIGHT;
            setSystemTheme(newSystemTheme);
            logger.info('Préférence système changée:', newSystemTheme);
        };

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, [logger]);

    // Appliquer les styles CSS personnalisés
    const applyCustomStyles = useCallback((themeName) => {
        const theme = customThemes[themeName];
        if (!theme) return;

        Object.entries(theme).forEach(([property, value]) => {
            document.documentElement.style.setProperty(`--${property}`, value);
        });
    }, [customThemes]);

    // Mettre à jour les classes CSS en fonction du thème
    const updateThemeClasses = useCallback((themeName) => {
        const root = document.documentElement;
        const effectiveTheme = themeName === COLOR_SCHEMES.SYSTEM ? systemTheme : themeName;

        // Supprimer les classes de thème existantes
        root.classList.remove('theme-light', 'theme-dark');
        Object.keys(customThemes).forEach(theme => {
            root.classList.remove(`theme-${theme}`);
        });

        // Ajouter la nouvelle classe de thème
        if (customThemes[effectiveTheme]) {
            root.classList.add(`theme-${effectiveTheme}`);
            applyCustomStyles(effectiveTheme);
        } else {
            root.classList.add(`theme-${effectiveTheme}`);
        }

        // Mettre à jour l'attribut data-theme pour les sélecteurs CSS
        root.setAttribute('data-theme', effectiveTheme);
    }, [systemTheme, customThemes, applyCustomStyles]);

    // Changer le thème
    const setTheme = useCallback((themeName) => {
        if (!themeName || (
            themeName !== COLOR_SCHEMES.SYSTEM && 
            themeName !== COLOR_SCHEMES.LIGHT && 
            themeName !== COLOR_SCHEMES.DARK && 
            !customThemes[themeName]
        )) {
            logger.error('Thème invalide:', themeName);
            return;
        }

        setCurrentTheme(themeName);
        localStorage.setItem(storageKey, themeName);
        updateThemeClasses(themeName);

        if (onChange) {
            onChange(themeName);
        }

        logger.info('Thème changé:', themeName);
    }, [storageKey, updateThemeClasses, onChange, customThemes, logger]);

    // Basculer entre les thèmes clair et sombre
    const toggleTheme = useCallback(() => {
        const effectiveTheme = currentTheme === COLOR_SCHEMES.SYSTEM 
            ? systemTheme 
            : currentTheme;

        const newTheme = effectiveTheme === COLOR_SCHEMES.LIGHT
            ? COLOR_SCHEMES.DARK
            : COLOR_SCHEMES.LIGHT;

        setTheme(newTheme);
    }, [currentTheme, systemTheme, setTheme]);

    // Obtenir le thème effectif (en tenant compte du thème système)
    const getEffectiveTheme = useCallback(() => {
        return currentTheme === COLOR_SCHEMES.SYSTEM
            ? systemTheme
            : currentTheme;
    }, [currentTheme, systemTheme]);

    // Vérifier si un thème est actif
    const isThemeActive = useCallback((themeName) => {
        if (themeName === COLOR_SCHEMES.SYSTEM) {
            return currentTheme === COLOR_SCHEMES.SYSTEM;
        }
        return getEffectiveTheme() === themeName;
    }, [currentTheme, getEffectiveTheme]);

    // Initialiser le thème au montage
    useEffect(() => {
        updateThemeClasses(currentTheme);
    }, [currentTheme, updateThemeClasses]);

    // Mettre à jour le thème quand la préférence système change
    useEffect(() => {
        if (currentTheme === COLOR_SCHEMES.SYSTEM) {
            updateThemeClasses(COLOR_SCHEMES.SYSTEM);
        }
    }, [systemTheme, currentTheme, updateThemeClasses]);

    return {
        currentTheme,
        systemTheme,
        setTheme,
        toggleTheme,
        getEffectiveTheme,
        isThemeActive,
        availableThemes: {
            ...COLOR_SCHEMES,
            ...Object.keys(customThemes).reduce((acc, theme) => {
                acc[theme.toUpperCase()] = theme;
                return acc;
            }, {})
        }
    };
};