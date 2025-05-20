import { useEffect, useCallback, useRef } from 'react';
import { useLogger } from './useLogger';

// Convertir les modificateurs MacOS en leurs équivalents Windows/Linux
const MAC_MODIFIER_MAP = {
    'cmd': 'ctrl',
    'command': 'ctrl',
    'option': 'alt',
    'ctl': 'ctrl'
};

export const useKeyboardShortcuts = (options = {}) => {
    const {
        shortcuts = {},
        enabled = true,
        preventDefault = true,
        stopPropagation = true,
        capturePhase = true,
        excludeInputs = true,
        excludeTextAreas = true,
        excludeContentEditable = true,
        multiKeyTimeout = 1000
    } = options;

    const logger = useLogger({ namespace: 'keyboard-shortcuts' });
    const pressedKeys = useRef(new Set());
    const lastKeyPressTime = useRef(0);
    const multiKeySequence = useRef([]);

    // Normaliser une touche
    const normalizeKey = useCallback((key) => {
        key = key.toLowerCase();
        return MAC_MODIFIER_MAP[key] || key;
    }, []);

    // Parser une combinaison de touches
    const parseKeyCombo = useCallback((combo) => {
        return combo.toLowerCase().split('+').map(key => normalizeKey(key.trim()));
    }, [normalizeKey]);

    // Vérifier si un élément doit être exclu
    const shouldExcludeTarget = useCallback((target) => {
        if (!excludeInputs && !excludeTextAreas && !excludeContentEditable) {
            return false;
        }

        const tagName = target.tagName.toLowerCase();
        const isInput = tagName === 'input' && excludeInputs;
        const isTextArea = tagName === 'textarea' && excludeTextAreas;
        const isContentEditable = target.isContentEditable && excludeContentEditable;

        return isInput || isTextArea || isContentEditable;
    }, [excludeInputs, excludeTextAreas, excludeContentEditable]);

    // Convertir un événement clavier en combinaison de touches
    const getEventKeyCombo = useCallback((event) => {
        const combo = [];
        
        if (event.ctrlKey) combo.push('ctrl');
        if (event.altKey) combo.push('alt');
        if (event.shiftKey) combo.push('shift');
        if (event.metaKey) combo.push('ctrl'); // Normaliser meta/command en ctrl

        const key = normalizeKey(event.key);
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
            combo.push(key);
        }

        return combo;
    }, [normalizeKey]);

    // Vérifier si une combinaison de touches correspond à un raccourci
    const matchesShortcut = useCallback((eventCombo, shortcutCombo) => {
        if (eventCombo.length !== shortcutCombo.length) {
            return false;
        }

        return shortcutCombo.every(key => eventCombo.includes(key));
    }, []);

    // Gérer les événements clavier
    const handleKeyDown = useCallback((event) => {
        if (!enabled) return;
        if (shouldExcludeTarget(event.target)) return;

        const now = Date.now();
        const key = normalizeKey(event.key);
        const eventCombo = getEventKeyCombo(event);

        // Gérer les séquences multi-touches
        if (now - lastKeyPressTime.current > multiKeyTimeout) {
            multiKeySequence.current = [];
        }
        lastKeyPressTime.current = now;

        pressedKeys.current.add(key);
        multiKeySequence.current.push(key);

        // Vérifier les raccourcis
        for (const [shortcut, handler] of Object.entries(shortcuts)) {
            const isSequence = shortcut.includes(',');

            if (isSequence) {
                // Vérifier les séquences de touches (ex: "g,d")
                const shortcutSequence = shortcut.split(',').map(k => normalizeKey(k.trim()));
                const sequenceMatches = shortcutSequence.every((key, index) => 
                    multiKeySequence.current[multiKeySequence.current.length - shortcutSequence.length + index] === key
                );

                if (sequenceMatches) {
                    if (preventDefault) event.preventDefault();
                    if (stopPropagation) event.stopPropagation();
                    handler(event);
                    multiKeySequence.current = [];
                    return;
                }
            } else {
                // Vérifier les combinaisons de touches (ex: "ctrl+s")
                const shortcutCombo = parseKeyCombo(shortcut);
                if (matchesShortcut(eventCombo, shortcutCombo)) {
                    if (preventDefault) event.preventDefault();
                    if (stopPropagation) event.stopPropagation();
                    handler(event);
                    return;
                }
            }
        }
    }, [
        enabled,
        shortcuts,
        shouldExcludeTarget,
        normalizeKey,
        getEventKeyCombo,
        matchesShortcut,
        parseKeyCombo,
        preventDefault,
        stopPropagation,
        multiKeyTimeout
    ]);

    // Gérer le relâchement des touches
    const handleKeyUp = useCallback((event) => {
        const key = normalizeKey(event.key);
        pressedKeys.current.delete(key);
    }, [normalizeKey]);

    // Nettoyer les touches pressées lors de la perte de focus
    const handleBlur = useCallback(() => {
        pressedKeys.current.clear();
        multiKeySequence.current = [];
    }, []);

    // Ajouter/retirer les écouteurs d'événements
    useEffect(() => {
        if (!enabled) return;

        const options = { capture: capturePhase };
        
        window.addEventListener('keydown', handleKeyDown, options);
        window.addEventListener('keyup', handleKeyUp, options);
        window.addEventListener('blur', handleBlur, options);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, options);
            window.removeEventListener('keyup', handleKeyUp, options);
            window.removeEventListener('blur', handleBlur, options);
        };
    }, [enabled, handleKeyDown, handleKeyUp, handleBlur, capturePhase]);

    // API publique
    return {
        pressedKeys: Array.from(pressedKeys.current),
        isPressed: (key) => pressedKeys.current.has(normalizeKey(key)),
        getCurrentSequence: () => [...multiKeySequence.current],
        clearSequence: () => {
            multiKeySequence.current = [];
        }
    };
};