import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const userRole = localStorage.getItem('rol');
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;
