import { useState, useCallback, useEffect } from 'react';
import { validationService } from '../services/validation.service';

export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValid, setIsValid] = useState(false);

    // Valider un champ spécifique
    const validateField = useCallback((name, value) => {
        const fieldRules = validationSchema[name];
        if (!fieldRules) return '';

        for (const rule of fieldRules) {
            if (typeof rule === 'function') {
                const result = rule(value, values);
                if (result !== true) {
                    return result;
                }
            } else {
                const validationResult = validationService.validateField(rule, value, values);
                if (!validationResult.isValid) {
                    return validationResult.message;
                }
            }
        }

        return '';
    }, [validationSchema, values]);

    // Valider tous les champs
    const validateForm = useCallback(() => {
        const newErrors = {};
        let formIsValid = true;

        Object.keys(validationSchema).forEach(field => {
            const error = validateField(field, values[field]);
            if (error) {
                newErrors[field] = error;
                formIsValid = false;
            }
        });

        setErrors(newErrors);
        setIsValid(formIsValid);
        return formIsValid;
    }, [validateField, values, validationSchema]);

    // Gérer les changements de valeurs
    const handleChange = useCallback((event) => {
        const { name, value, type, checked } = event.target;
        const newValue = type === 'checkbox' ? checked : value;

        setValues(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Validation en temps réel si le champ a été touché
        if (touched[name]) {
            const error = validateField(name, newValue);
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }
    }, [touched, validateField]);

    // Gérer la perte de focus
    const handleBlur = useCallback((event) => {
        const { name } = event.target;
        
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        const error = validateField(name, values[name]);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, [validateField, values]);

    // Gérer la soumission du formulaire
    const handleSubmit = useCallback((onSubmit) => {
        return async (event) => {
            event.preventDefault();
            setIsSubmitting(true);

            // Marquer tous les champs comme touchés
            const allTouched = Object.keys(validationSchema).reduce(
                (acc, field) => ({ ...acc, [field]: true }),
                {}
            );
            setTouched(allTouched);

            try {
                if (validateForm()) {
                    await onSubmit(values);
                }
            } catch (error) {
                setErrors(prev => ({
                    ...prev,
                    submit: error.message
                }));
            } finally {
                setIsSubmitting(false);
            }
        };
    }, [validateForm, values, validationSchema]);

    // Réinitialiser le formulaire
    const resetForm = useCallback((newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    // Définir une valeur spécifique
    const setFieldValue = useCallback((field, value) => {
        setValues(prev => ({
            ...prev,
            [field]: value
        }));

        if (touched[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [field]: error
            }));
        }
    }, [touched, validateField]);

    // Définir une erreur spécifique
    const setFieldError = useCallback((field, error) => {
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    }, []);

    // Définir l'état "touché" d'un champ
    const setFieldTouched = useCallback((field, isTouched = true) => {
        setTouched(prev => ({
            ...prev,
            [field]: isTouched
        }));
    }, []);

    // Valider le formulaire lors des changements
    useEffect(() => {
        if (Object.keys(touched).length > 0) {
            validateForm();
        }
    }, [values, validateForm]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        validateField,
        validateForm
    };
};