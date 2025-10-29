import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth, useToggle } from '../../hooks';
import { Button } from '../common';
import { ROUTES } from '../../utils/constants';

const Navbar = () => {
  const { user, role, logout, isMesero, isCocina, isCaja, isGerente } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, toggleMobileMenu, openMobileMenu, closeMobileMenu] = useToggle(false);

  const menuItems = {
    mesero: [
      { label: 'Dashboard', path: ROUTES.MESERO_DASHBOARD },
      { label: 'Nuevo Pedido', path: ROUTES.MESERO_NUEVO_PEDIDO },
      { label: 'Mis Pedidos', path: ROUTES.MESERO_PEDIDOS },
    ],
    cocina: [
      { label: 'Dashboard', path: ROUTES.COCINA_DASHBOARD },
      { label: 'Pedidos', path: ROUTES.COCINA_PEDIDOS },
    ],
    caja: [
      { label: 'Dashboard', path: ROUTES.CAJA_DASHBOARD },
      { label: 'Pedidos', path: ROUTES.CAJA_PEDIDOS },
      { label: 'Comprobantes', path: ROUTES.CAJA_COMPROBANTES },
    ],
    gerente: [
      { label: 'Dashboard', path: ROUTES.GERENCIA_DASHBOARD },
      { label: 'Reportes', path: ROUTES.GERENCIA_REPORTES },
      { label: 'Disponibilidad', path: ROUTES.GERENCIA_DISPONIBILIDAD },
      { label: 'Usuarios', path: ROUTES.GERENCIA_USUARIOS },
    ],
  };

  const currentMenuItems = menuItems[role] || [];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              🔥
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                La Hueca del Sabor
              </h1>
              <p className="text-xs text-gray-500 capitalize">
                {role ? `Panel de ${role}` : 'Sistema de Gestión'}
              </p>
            </div>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {currentMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Usuario y Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
              <FaUser className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {user?.nombre || 'Usuario'}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<FaSignOutAlt />}
            >
              Cerrar Sesión
            </Button>
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {/* Usuario info */}
            <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-gray-50">
              <FaUser className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {user?.nombre || 'Usuario'}
              </span>
            </div>

            {/* Menú items */}
            {currentMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={() => {
                closeMobileMenu();
                handleLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-2"
            >
              <FaSignOutAlt />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;