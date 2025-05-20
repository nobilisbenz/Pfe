import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Nettoyer le localStorage au démarrage de l'application
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                if (tokenData.exp * 1000 < Date.now()) {
                    // Token expiré, nettoyer le localStorage
                    authService.logout();
                }
            } catch {
                // Token invalide, nettoyer le localStorage
                authService.logout();
            }
        }

        // Vérifier l'authentification au chargement
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                const userType = authService.getUserType();
                try {
                    const profileData = await authService.getProfile(userType);
                    setUser({
                        ...profileData.data,
                        role: authService.getUserRole(),
                        type: userType
                    });
                } catch (error) {
                    console.error('Erreur lors du chargement du profil:', error);
                    authService.logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email, password, userType) => {
        try {
            const result = await authService.login(email, password, userType);
            setUser({
                ...result.user,
                type: userType
            });
            return result;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};