import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Spinner } from '../components/common';
import { ROUTES } from '../utils/constants';

/**
 * Componente para proteger rutas privadas
 * @param {object} props - Propiedades
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {string} props.requiredRole - Rol requerido (opcional)
 * @param {string[]} props.allowedRoles - Roles permitidos (opcional)
 */
const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { isLoggedIn, isLoading, role } = useAuth();

  // Mostrar spinner mientras carga el estado de autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="xl" text="Verificando autenticación..." />
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si se requiere un rol específico
  if (requiredRole && role !== requiredRole) {
    console.warn(`Acceso denegado: se requiere rol ${requiredRole}, pero el usuario tiene ${role}`);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si se especificaron roles permitidos
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(`Acceso denegado: roles permitidos ${allowedRoles}, usuario tiene ${role}`);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Si está autenticado y tiene el rol correcto, renderizar los hijos
  return children;
};

export default ProtectedRoute;