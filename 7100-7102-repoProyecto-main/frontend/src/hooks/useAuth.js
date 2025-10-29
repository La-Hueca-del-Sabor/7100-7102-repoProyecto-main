import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isAuthenticated,
  getUserRole,
  getAuthData,
  clearAuthToken
} from '../services/api/apiClient';
import { ROUTES, ROLES } from '../utils/constants';

/**
 * Hook personalizado para gestionar autenticación
 * @returns {object} - Estado y funciones de autenticación
 */
const useAuth = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());
  const [role, setRole] = useState(getUserRole());
  const [user, setUser] = useState(getAuthData());
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const userRole = getUserRole();
      const userData = getAuthData();

      setIsLoggedIn(authenticated);
      setRole(userRole);
      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Actualiza el estado de autenticación
   */
  const refreshAuth = useCallback(() => {
    const authenticated = isAuthenticated();
    const userRole = getUserRole();
    const userData = getAuthData();

    setIsLoggedIn(authenticated);
    setRole(userRole);
    setUser(userData);
  }, []);

  /**
   * Cierra la sesión del usuario
   */
  const logout = useCallback(() => {
    clearAuthToken();
    setIsLoggedIn(false);
    setRole(null);
    setUser(null);
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} requiredRole - Rol requerido
   * @returns {boolean} - True si tiene el rol
   */
  const hasRole = useCallback((requiredRole) => {
    return role === requiredRole;
  }, [role]);

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {string[]} roles - Array de roles permitidos
   * @returns {boolean} - True si tiene alguno de los roles
   */
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(role);
  }, [role]);

  /**
   * Redirige al dashboard correspondiente según el rol
   */
  const redirectToDashboard = useCallback(() => {
    switch (role) {
      case ROLES.MESERO:
        navigate(ROUTES.MESERO_DASHBOARD);
        break;
      case ROLES.COCINA:
        navigate(ROUTES.COCINA_DASHBOARD);
        break;
      case ROLES.CAJA:
        navigate(ROUTES.CAJA_DASHBOARD);
        break;
      case ROLES.GERENTE:
        navigate(ROUTES.GERENCIA_DASHBOARD);
        break;
      default:
        navigate(ROUTES.LOGIN);
    }
  }, [role, navigate]);

  /**
   * Verifica si el usuario puede acceder a una ruta
   * @param {string} requiredRole - Rol requerido para la ruta
   * @returns {boolean} - True si puede acceder
   */
  const canAccess = useCallback((requiredRole) => {
    return isLoggedIn && hasRole(requiredRole);
  }, [isLoggedIn, hasRole]);

  return {
    // Estado
    isLoggedIn,
    isLoading,
    role,
    user,

    // Funciones
    logout,
    refreshAuth,
    hasRole,
    hasAnyRole,
    redirectToDashboard,
    canAccess,

    // Verificaciones rápidas de rol
    isMesero: role === ROLES.MESERO,
    isCocina: role === ROLES.COCINA,
    isCaja: role === ROLES.CAJA,
    isGerente: role === ROLES.GERENTE,
  };
};

export default useAuth;