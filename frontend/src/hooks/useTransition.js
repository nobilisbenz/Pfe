import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const useTransition = (initialState = false) => {
    const [isVisible, setIsVisible] = useState(initialState);
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef(null);

    const defaultTransition = {
        type: 'spring',
        stiffness: 300,
        damping: 30
    };

    const defaultVariants = {
        initial: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.95
        }
    };

    const show = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(true);
        setIsAnimating(true);
    }, []);

    const hide = useCallback(() => {
        setIsVisible(false);
        setIsAnimating(true);
    }, []);

    const onAnimationComplete = useCallback(() => {
        setIsAnimating(false);
        if (!isVisible) {
            timeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
            }, 300); // Délai pour s'assurer que l'animation est terminée
        }
    }, [isVisible]);

    // Composant de transition réutilisable
    const Transition = useCallback(({ children, customVariants, customTransition, ...props }) => (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={customVariants || defaultVariants}
                    transition={customTransition || defaultTransition}
                    onAnimationComplete={onAnimationComplete}
                    {...props}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    ), [isVisible, onAnimationComplete]);

    // Composant pour les transitions de page
    const PageTransition = useCallback(({ children, ...props }) => (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            {...props}
        >
            {children}
        </motion.div>
    ), []);

    // Hook pour créer des variants d'animation personnalisés
    const createVariants = useCallback(({
        initial = {},
        animate = {},
        exit = {},
        transition = {}
    } = {}) => ({
        initial: { ...defaultVariants.initial, ...initial },
        animate: { ...defaultVariants.animate, ...animate },
        exit: { ...defaultVariants.exit, ...exit },
        transition: { ...defaultTransition, ...transition }
    }), []);

    return {
        isVisible,
        isAnimating,
        show,
        hide,
        Transition,
        PageTransition,
        createVariants
    };
};