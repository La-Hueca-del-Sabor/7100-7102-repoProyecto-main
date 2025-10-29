import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Componentes de autenticación
import {
  Login,
  ForgotPassword,
  ResetPassword,
  EmailVerification,
} from '../modules/auth/components';

// Componentes de módulos
import { MeseroDashboard, NuevoPedido, MeseroPedidos } from '../modules/mesero/components';
import { CocinaDashboard } from '../modules/cocina/components';
import { CajaDashboard } from '../modules/caja/components';
import { GerenciaDashboard, ActualizarDisponibilidad } from '../modules/gerencia/components';

// Componente de ruta protegida
import ProtectedRoute from './ProtectedRoute';

// Utilidades
import { ROUTES, ROLES } from '../utils/constants';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ==================== RUTAS PÚBLICAS ==================== */}

      {/* Login */}
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* Forgot Password */}
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />

      {/* Reset Password */}
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      {/* Email Verification */}
      <Route path={ROUTES.VERIFY_EMAIL} element={<EmailVerification />} />

      {/* ==================== RUTAS PRIVADAS - MESERO ==================== */}

      <Route
        path={ROUTES.MESERO_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={ROLES.MESERO}>
            <MeseroDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MESERO_PEDIDOS}
        element={
          <ProtectedRoute requiredRole={ROLES.MESERO}>
            <MeseroPedidos />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.MESERO_NUEVO_PEDIDO}
        element={
          <ProtectedRoute requiredRole={ROLES.MESERO}>
            <NuevoPedido />
          </ProtectedRoute>
        }
      />

      {/* ==================== RUTAS PRIVADAS - COCINA ==================== */}

      <Route
        path={ROUTES.COCINA_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={ROLES.COCINA}>
            <CocinaDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.COCINA_PEDIDOS}
        element={
          <ProtectedRoute requiredRole={ROLES.COCINA}>
            <CocinaDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== RUTAS PRIVADAS - CAJA ==================== */}

      <Route
        path={ROUTES.CAJA_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={ROLES.CAJA}>
            <CajaDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CAJA_PEDIDOS}
        element={
          <ProtectedRoute requiredRole={ROLES.CAJA}>
            <CajaDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CAJA_COMPROBANTES}
        element={
          <ProtectedRoute requiredRole={ROLES.CAJA}>
            <CajaDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== RUTAS PRIVADAS - GERENCIA ==================== */}

      <Route
        path={ROUTES.GERENCIA_DASHBOARD}
        element={
          <ProtectedRoute requiredRole={ROLES.GERENTE}>
            <GerenciaDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.GERENCIA_REPORTES}
        element={
          <ProtectedRoute requiredRole={ROLES.GERENTE}>
            <GerenciaDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.GERENCIA_DISPONIBILIDAD}
        element={
          <ProtectedRoute requiredRole={ROLES.GERENTE}>
            <ActualizarDisponibilidad />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.GERENCIA_USUARIOS}
        element={
          <ProtectedRoute requiredRole={ROLES.GERENTE}>
            <GerenciaDashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== RUTA POR DEFECTO ==================== */}

      {/* Redirigir cualquier ruta no definida al login */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;