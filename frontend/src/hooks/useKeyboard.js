import { useEffect, useCallback, useRef } from 'react';

export const useKeyboard = (options = {}) => {
    const {
        global = false,
        preventDefault = true,
        stopPropagation = true,
        keyPrefix = 'ctrl',
        enabled = true
    } = options;

    const shortcuts = useRef(new Map());
    const combinations = useRef(new Set());

    // Convertir une combinaison de touches en chaîne unique
    const getCombination = useCallback((event) => {
        const parts = [];
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        parts.push(event.key.toLowerCase());
        return parts.join('+');
    }, []);

    // Gérer les événements clavier
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;

        const combination = getCombination(event);
        if (!combinations.current.has(combination)) return;

        const handlers = shortcuts.current.get(combination) || [];
        let shouldPrevent = false;

        handlers.forEach(({ callback, options: handlerOptions }) => {
            if (handlerOptions.preventDefault) shouldPrevent = true;
            callback(event);
        });

        if (shouldPrevent && preventDefault) {
            event.preventDefault();
        }
        if (stopPropagation) {
            event.stopPropagation();
        }
    }, [enabled, getCombination, preventDefault, stopPropagation]);

    // Enregistrer un raccourci
    const registerShortcut = useCallback((keys, callback, handlerOptions = {}) => {
        // Normaliser les touches
        const normalizedKeys = typeof keys === 'string'
            ? keys
            : Array.isArray(keys)
                ? keys.join('+')
                : '';

        // Ajouter le préfixe si nécessaire
        const combination = normalizedKeys.includes('+')
            ? normalizedKeys.toLowerCase()
            : `${keyPrefix}+${normalizedKeys.toLowerCase()}`;

        if (!shortcuts.current.has(combination)) {
            shortcuts.current.set(combination, []);
        }

        combinations.current.add(combination);
        shortcuts.current.get(combination).push({
            callback,
            options: {
                preventDefault,
                stopPropagation,
                ...handlerOptions
            }
        });

        return () => {
            const handlers = shortcuts.current.get(combination);
            if (handlers) {
                const index = handlers.findIndex(h => h.callback === callback);
                if (index !== -1) {
                    handlers.splice(index, 1);
                    if (handlers.length === 0) {
                        shortcuts.current.delete(combination);
                        combinations.current.delete(combination);
                    }
                }
            }
        };
    }, [keyPrefix, preventDefault, stopPropagation]);

    // Enregistrer plusieurs raccourcis
    const registerShortcuts = useCallback((shortcutsMap) => {
        const unsubscribes = Object.entries(shortcutsMap).map(([keys, callback]) =>
            registerShortcut(keys, callback)
        );

        return () => unsubscribes.forEach(unsubscribe => unsubscribe());
    }, [registerShortcut]);

    // Supprimer un raccourci
    const unregisterShortcut = useCallback((keys) => {
        const combination = typeof keys === 'string'
            ? keys.toLowerCase()
            : Array.isArray(keys)
                ? keys.join('+').toLowerCase()
                : '';

        shortcuts.current.delete(combination);
        combinations.current.delete(combination);
    }, []);

    // Nettoyer tous les raccourcis
    const clearShortcuts = useCallback(() => {
        shortcuts.current.clear();
        combinations.current.clear();
    }, []);

    // Gérer les événements au montage/démontage
    useEffect(() => {
        if (!enabled) return;

        const target = global ? window : document;
        target.addEventListener('keydown', handleKeyDown);

        return () => {
            target.removeEventListener('keydown', handleKeyDown);
            clearShortcuts();
        };
    }, [enabled, global, handleKeyDown, clearShortcuts]);

    return {
        registerShortcut,
        registerShortcuts,
        unregisterShortcut,
        clearShortcuts
    };
};