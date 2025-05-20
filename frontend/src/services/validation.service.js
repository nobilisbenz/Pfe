class ValidationService {
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            isValid: emailRegex.test(email),
            message: emailRegex.test(email) ? '' : 'Format email invalide'
        };
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const isValid = password.length >= minLength &&
            hasUpperCase &&
            hasLowerCase &&
            hasNumbers &&
            hasSpecialChar;

        return {
            isValid,
            message: isValid ? '' : 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
        };
    }

    validateRequired(value, fieldName) {
        const isValid = value !== null && value !== undefined && value.toString().trim() !== '';
        return {
            isValid,
            message: isValid ? '' : `${fieldName} est requis`
        };
    }

    validateName(name) {
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
        return {
            isValid: nameRegex.test(name),
            message: nameRegex.test(name) ? '' : 'Le nom doit contenir entre 2 et 50 caractères et ne peut contenir que des lettres'
        };
    }

    validateDate(date) {
        const dateObj = new Date(date);
        const isValid = !isNaN(dateObj.getTime());
        return {
            isValid,
            message: isValid ? '' : 'Date invalide'
        };
    }

    validatePhoneNumber(phone) {
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{4,9}$/;
        return {
            isValid: phoneRegex.test(phone),
            message: phoneRegex.test(phone) ? '' : 'Numéro de téléphone invalide'
        };
    }

    validateNumber(value, min, max) {
        const num = Number(value);
        const isValid = !isNaN(num) && (!min || num >= min) && (!max || num <= max);
        return {
            isValid,
            message: isValid ? '' : `La valeur doit être un nombre${min ? ` supérieur à ${min}` : ''}${max ? ` et inférieur à ${max}` : ''}`
        };
    }

    validateForm(formData, validationRules) {
        const errors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(field => {
            const rules = validationRules[field];
            const value = formData[field];

            rules.forEach(rule => {
                if (typeof rule === 'function') {
                    const result = rule(value);
                    if (!result.isValid) {
                        errors[field] = result.message;
                        isValid = false;
                    }
                } else {
                    switch (rule) {
                        case 'required':
                            const requiredCheck = this.validateRequired(value, field);
                            if (!requiredCheck.isValid) {
                                errors[field] = requiredCheck.message;
                                isValid = false;
                            }
                            break;
                        case 'email':
                            const emailCheck = this.validateEmail(value);
                            if (!emailCheck.isValid) {
                                errors[field] = emailCheck.message;
                                isValid = false;
                            }
                            break;
                        // Ajoutez d'autres règles au besoin
                    }
                }
            });
        });

        return {
            isValid,
            errors
        };
    }
}

export const validationService = new ValidationService();