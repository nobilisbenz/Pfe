import { useState, useCallback, useEffect, useRef } from 'react';
import { useLogger } from './useLogger';

const VALIDATION_TYPES = {
    REQUIRED: 'required',
    MIN_LENGTH: 'minLength',
    MAX_LENGTH: 'maxLength',
    PATTERN: 'pattern',
    CUSTOM: 'custom',
    DEPENDENCIES: 'dependencies'
};

export const useForm = (options = {}) => {
    const {
        initialValues = {},
        validationSchema = {},
        onSubmit = null,
        onError = null,
        validateOnChange = true,
        validateOnBlur = true,
        validateOnMount = false,
        reValidateOnChange = true
    } = options;

    const logger = useLogger({ namespace: 'form' });
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const mountedRef = useRef(false);
    const validationTimeoutRef = useRef(null);

    // Valider une valeur unique
    const validateField = useCallback(async (name, value, allValues = values) => {
        const fieldValidation = validationSchema[name];
        if (!fieldValidation) return null;

        try {
            // Validation required
            if (fieldValidation.required && !value) {
                return fieldValidation.required.message || 'Ce champ est requis';
            }

            // Validation longueur minimale
            if (fieldValidation.minLength && String(value).length < fieldValidation.minLength.value) {
                return fieldValidation.minLength.message || 
                       `Minimum ${fieldValidation.minLength.value} caractères requis`;
            }

            // Validation longueur maximale
            if (fieldValidation.maxLength && String(value).length > fieldValidation.maxLength.value) {
                return fieldValidation.maxLength.message || 
                       `Maximum ${fieldValidation.maxLength.value} caractères autorisés`;
            }

            // Validation pattern
            if (fieldValidation.pattern && !fieldValidation.pattern.value.test(String(value))) {
                return fieldValidation.pattern.message || 'Format invalide';
            }

            // Validation personnalisée
            if (fieldValidation.custom) {
                const customError = await fieldValidation.custom.validator(value, allValues);
                if (customError) {
                    return customError;
                }
            }

            // Validation des dépendances
            if (fieldValidation.dependencies) {
                for (const dep of fieldValidation.dependencies) {
                    const depValue = allValues[dep.field];
                    const depError = await dep.validator(value, depValue, allValues);
                    if (depError) {
                        return depError;
                    }
                }
            }

            return null;
        } catch (error) {
            logger.error('Erreur lors de la validation:', error);
            return 'Erreur de validation';
        }
    }, [validationSchema, values, logger]);

    // Valider tous les champs
    const validateForm = useCallback(async (formValues = values) => {
        setIsValidating(true);
        const newErrors = {};
        
        try {
            await Promise.all(
                Object.keys(validationSchema).map(async (fieldName) => {
                    const error = await validateField(
                        fieldName,
                        formValues[fieldName],
                        formValues
                    );
                    if (error) {
                        newErrors[fieldName] = error;
                    }
                })
            );
        } catch (error) {
            logger.error('Erreur lors de la validation du formulaire:', error);
        }

        setIsValidating(false);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [validationSchema, values, validateField, logger]);

    // Gérer le changement de valeur
    const handleChange = useCallback(async (name, value) => {
        const newValues = { ...values, [name]: value };
        setValues(newValues);
        setTouched(prev => ({ ...prev, [name]: true }));

        if (validateOnChange) {
            // Debounce la validation
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
            
            validationTimeoutRef.current = setTimeout(async () => {
                const error = await validateField(name, value, newValues);
                setErrors(prev => ({
                    ...prev,
                    [name]: error
                }));
            }, 300);
        }
    }, [values, validateOnChange, validateField]);

    // Gérer la perte de focus
    const handleBlur = useCallback(async (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));

        if (validateOnBlur) {
            const error = await validateField(name, values[name]);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    }, [values, validateOnBlur, validateField]);

    // Gérer la soumission du formulaire
    const handleSubmit = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
        }

        setIsSubmitting(true);
        const isValid = await validateForm();

        if (!isValid) {
            setIsSubmitting(false);
            if (onError) {
                onError(errors);
            }
            return;
        }

        try {
            if (onSubmit) {
                await onSubmit(values);
            }
        } catch (error) {
            logger.error('Erreur lors de la soumission:', error);
            if (onError) {
                onError({ submit: error.message });
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [values, errors, validateForm, onSubmit, onError, logger]);

    // Réinitialiser le formulaire
    const reset = useCallback((newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
        setIsValidating(false);
    }, [initialValues]);

    // Définir une valeur spécifique
    const setValue = useCallback((name, value, shouldValidate = reValidateOnChange) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        if (shouldValidate) {
            validateField(name, value).then(error => {
                setErrors(prev => ({
                    ...prev,
                    [name]: error
                }));
            });
        }
    }, [reValidateOnChange, validateField]);

    // Définir une erreur spécifique
    const setError = useCallback((name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    // Vérifier si le formulaire est valide
    const isValid = useCallback(() => {
        return Object.keys(errors).length === 0;
    }, [errors]);

    // Valider au montage si nécessaire
    useEffect(() => {
        if (validateOnMount && !mountedRef.current) {
            validateForm();
            mountedRef.current = true;
        }
    }, [validateOnMount, validateForm]);

    // Nettoyer les timeouts au démontage
    useEffect(() => {
        return () => {
            if (validationTimeoutRef.current) {
                clearTimeout(validationTimeoutRef.current);
            }
        };
    }, []);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValidating,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setValue,
        setError,
        isValid,
        validateField,
        validateForm
    };
};