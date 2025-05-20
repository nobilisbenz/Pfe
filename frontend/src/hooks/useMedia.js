import { useState, useCallback } from 'react';
import { utilsService } from '../services/utils.service';

export const useMedia = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    // Validation des fichiers
    const validateFile = useCallback((file, options = {}) => {
        const {
            maxSize = 5 * 1024 * 1024, // 5MB par défaut
            allowedTypes = [],
            maxWidth = null,
            maxHeight = null
        } = options;

        return new Promise((resolve, reject) => {
            // Vérifier la taille
            if (file.size > maxSize) {
                reject(new Error(`Le fichier est trop volumineux (max: ${utilsService.formatFileSize(maxSize)})`));
                return;
            }

            // Vérifier le type
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
                reject(new Error(`Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}`));
                return;
            }

            // Pour les images, vérifier les dimensions
            if (file.type.startsWith('image/') && (maxWidth || maxHeight)) {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                
                img.onload = () => {
                    URL.revokeObjectURL(img.src);
                    if (maxWidth && img.width > maxWidth) {
                        reject(new Error(`Largeur maximale dépassée (max: ${maxWidth}px)`));
                        return;
                    }
                    if (maxHeight && img.height > maxHeight) {
                        reject(new Error(`Hauteur maximale dépassée (max: ${maxHeight}px)`));
                        return;
                    }
                    resolve(true);
                };

                img.onerror = () => {
                    URL.revokeObjectURL(img.src);
                    reject(new Error('Impossible de charger l\'image'));
                };
            } else {
                resolve(true);
            }
        });
    }, []);

    // Compression d'image
    const compressImage = useCallback(async (file, options = {}) => {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            type = 'image/jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(img.src);
                
                // Calculer les nouvelles dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                // Créer le canvas pour la compression
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir en blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type }));
                        } else {
                            reject(new Error('Échec de la compression'));
                        }
                    },
                    type,
                    quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error('Impossible de charger l\'image'));
            };
        });
    }, []);

    // Upload de fichier avec progression
    const uploadFile = useCallback(async (file, uploadFunction, options = {}) => {
        setUploading(true);
        setProgress(0);
        setError(null);

        try {
            // Valider le fichier
            await validateFile(file, options);

            // Compresser si c'est une image
            let processedFile = file;
            if (file.type.startsWith('image/') && options.compress !== false) {
                processedFile = await compressImage(file, options.compression);
            }

            // Créer FormData
            const formData = new FormData();
            formData.append('file', processedFile);

            // Ajouter les métadonnées
            if (options.metadata) {
                Object.entries(options.metadata).forEach(([key, value]) => {
                    formData.append(key, value);
                });
            }

            // Upload avec progression
            const response = await uploadFunction(formData, (progressEvent) => {
                const percentage = (progressEvent.loaded * 100) / progressEvent.total;
                setProgress(Math.round(percentage));
            });

            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [validateFile, compressImage]);

    // Récupérer un aperçu du fichier
    const getFilePreview = useCallback((file) => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                resolve(URL.createObjectURL(file));
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    video.currentTime = 1;
                };
                video.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    resolve(canvas.toDataURL());
                };
                video.src = URL.createObjectURL(file);
            } else {
                resolve(null);
            }
        });
    }, []);

    return {
        uploading,
        progress,
        error,
        validateFile,
        compressImage,
        uploadFile,
        getFilePreview
    };
};