import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { FiUser, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { isAuthenticated, logout } = useAuth();

  // Écouter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu profil lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tous les liens de navigation
  const navItems = [
    { path: '/', label: 'Accueil', icon: '🏠' },
    { path: '/courses', label: 'Formations', icon: '📚' },
    { path: '/news', label: 'Actualités', icon: '📰' },
    { path: '/about', label: 'À propos', icon: 'ℹ️' }
  ];

  const isActive = (path) => location.pathname === path;

  // Fonction pour obtenir le chemin du dashboard selon le rôle
  const getDashboardPath = () => {
    const userRole = authService.getUserRole();
    switch (userRole) {
      case 'admin':
        return { path: '/dashboard', icon: '🔐', label: 'Tableau de bord' };
      case 'teacher':
        return { path: '/teacher/dashboard', icon: '👨‍🏫', label: 'Tableau de bord' };
      case 'student':
        return { path: '/student/dashboard', icon: '👨‍🎓', label: 'Tableau de bord' };
      default:
        return { path: '/', icon: '🏠', label: 'Accueil' };
    }
  };

  const getProfilePath = () => {
    const userRole = authService.getUserRole();
    switch (userRole) {
      case 'admin':
        return '/dashboard?tab=profile';
      case 'teacher':
        return '/teacher/dashboard?tab=profile';
      case 'student':
        return '/student/dashboard?tab=profile';
      default:
        return '/';
    }
  };

  // Fonction pour gérer le clic sur le lien du profil
  const handleProfileClick = () => {
    setShowProfileMenu(false);
    const path = getProfilePath();
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav 
      className={`
        ${isScrolled 
          ? 'bg-gradient-to-r from-mandarine-100 to-mandarine-500 dark:from-gray-800 dark:to-gray-900 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-r from-mandarine-100 to-mandarine-500 dark:from-gray-800 dark:to-gray-900'
        }
        fixed top-0 left-0 right-0 z-30 transition-all duration-300
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et navigation principale */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="EFGB Portal Logo" 
                className="h-10 w-auto object-contain bg-gradient-to-r from-orange-100 to-blue-600 rounded-lg transform transition-all duration-300 hover:scale-105"
              />
            </Link>
            
            {/* Navigation items - desktop */}
            <div className="hidden md:flex md:items-center md:ml-10 space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-mandarine-100 dark:bg-mandarine-600 text-mandarine-600 dark:text-white transform scale-105'
                      : 'text-gray-600 dark:text-gray-200 hover:bg-mandarine-50 dark:hover:bg-mandarine-600/50 hover:text-mandarine-600 dark:hover:text-white'
                    }
                  `}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions (Dark mode, Profil, Login) */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-300 bg-mandarine-50 dark:bg-gray-700 hover:bg-mandarine-100 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" fillRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              )}
            </button>

            {isAuthenticated() ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-mandarine-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-mandarine-200 dark:bg-mandarine-600 flex items-center justify-center text-mandarine-600 dark:text-white font-semibold">
                    {authService.getUserName()?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                        <p className="font-semibold">{authService.getUserName()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {authService.getUserRole()?.charAt(0).toUpperCase() + authService.getUserRole()?.slice(1)}
                        </p>
                      </div>
                      <Link
                        to={getDashboardPath().path}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <span className="mr-2">{getDashboardPath().icon}</span>
                        Tableau de bord
                      </Link>
                      <Link
                        to={getProfilePath()}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <span className="mr-2">👤</span>
                        Mon profil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <span className="mr-2">🚪</span>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mandarine-600 hover:bg-mandarine-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mandarine-500 transition-colors"
              >
                <span className="mr-2">🔑</span>
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;