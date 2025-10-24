import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('role');
  
  // Añadir logs de depuración
  console.log('Role en localStorage:', userRole);
  console.log('Roles permitidos:', allowedRoles);
  console.log('¿Incluye el rol?', allowedRoles.includes(userRole));
  
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    console.log('Redirigiendo a login porque el rol no coincide');
    return <Navigate to="/" replace />;
  }
  return children;
};
export default PrivateRoute;
