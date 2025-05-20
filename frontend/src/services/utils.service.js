class UtilsService {
    // Formatage des dates
    formatDate(date, format = 'dd/MM/yyyy') {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';

        const pad = (num) => num.toString().padStart(2, '0');

        const formats = {
            'dd/MM/yyyy': `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
            'MM/dd/yyyy': `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`,
            'yyyy-MM-dd': `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            'full': d.toLocaleString(),
            'time': `${pad(d.getHours())}:${pad(d.getMinutes())}`
        };

        return formats[format] || formats['dd/MM/yyyy'];
    }

    // Formatage des montants
    formatAmount(amount, currency = 'DZD') {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Stockage local
    saveToLocalStorage(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    getFromLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    }

    removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }

    // Génération d'ID uniques
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Calcul d'âge
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Formater le nom d'utilisateur
    formatUserName(firstName, lastName) {
        return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)} ${lastName.toUpperCase()}`;
    }

    // Tronquer un texte
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Conversion de taille de fichier
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Vérifier si une valeur est vide
    isEmpty(value) {
        return (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0)
        );
    }

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

export const utilsService = new UtilsService();