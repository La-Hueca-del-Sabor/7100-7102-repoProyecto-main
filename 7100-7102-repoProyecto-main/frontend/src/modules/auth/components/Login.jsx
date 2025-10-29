import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Componentes
import { Button, Input, Alert } from '../../../components/common';
import Register from './Register';

// Hooks
import { useForm, useAuth, useToggle } from '../../../hooks';

// Servicios
import authService from '../services/authService';
import { setAuthToken } from '../../../services/api/apiClient';

// Utilidades
import {
  validateEmail,
  validatePassword,
  sanitizeEmail
} from '../../../utils/validators';
import { ROUTES } from '../../../utils/constants';

// Assets
import loginImage from '../../../assets/login.jpg';

const Login = () => {
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [isRegisterOpen, , openRegister, closeRegister] = useToggle(false);

  // Reglas de validación
  const validationRules = {
    email: [validateEmail],
    password: [validatePassword],
  };

  // Función onSubmit
  const handleLogin = async (values) => {
    setBackendError('');

    try {
      // Sanitizar email
      const email = sanitizeEmail(values.email);

      // Llamar al servicio de login
      const data = await authService.login(email, values.password);

      // Guardar token y datos de usuario
      setAuthToken(data.token);
      localStorage.setItem('role', data.roleName);
      localStorage.setItem('authData', JSON.stringify({
        nombre: data.perfil?.nombres || 'Usuario',
        rol: data.roleName,
      }));

      // Actualizar estado de autenticación
      refreshAuth();

      // Mostrar mensaje de bienvenida
      toast.success(`¡Bienvenido de nuevo, ${data.perfil?.nombres || 'Usuario'}!`);

      // Redirigir según rol
      switch (data.roleName) {
        case 'mesero':
          navigate(ROUTES.MESERO_DASHBOARD);
          break;
        case 'caja':
          navigate(ROUTES.CAJA_DASHBOARD);
          break;
        case 'cocina':
          navigate(ROUTES.COCINA_DASHBOARD);
          break;
        case 'gerente':
          navigate(ROUTES.GERENCIA_DASHBOARD);
          break;
        default:
          setBackendError('Rol desconocido: ' + data.roleName);
      }
    } catch (error) {
      console.error('Error en login:', error);

      if (error.response?.data?.error) {
        setBackendError(error.response.data.error);
      } else {
        setBackendError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    }
  };

  // Hook de formulario
  const {
    values,
    errors,
    handleInputChange,
    handleInputBlur,
    handleSubmit,
    isSubmitting,
  } = useForm(
    { email: '', password: '' },
    validationRules,
    handleLogin
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-hard overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Formulario de Login */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                {/* Título */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Bienvenido
                  </h1>
                  <p className="text-gray-600">
                    Inicia sesión en tu cuenta
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <Input
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={values.email}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.email}
                    leftIcon={<FaEnvelope className="text-gray-400" />}
                    required
                  />

                  {/* Contraseña */}
                  <Input
                    label="Contraseña"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={values.password}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.password}
                    leftIcon={<FaLock className="text-gray-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    }
                    required
                  />

                  {/* Error del backend */}
                  {backendError && (
                    <Alert variant="danger" dismissible onClose={() => setBackendError('')}>
                      {backendError}
                    </Alert>
                  )}

                  {/* Botón de envío */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                  >
                    Iniciar Sesión
                  </Button>

                  {/* ¿Olvidaste tu contraseña? */}
                  <div className="text-center">
                    <Link
                      to={ROUTES.FORGOT_PASSWORD}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">
                        ¿No tienes una cuenta?
                      </span>
                    </div>
                  </div>

                  {/* Link a registro */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={openRegister}
                      className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                    >
                      Regístrate aquí
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Imagen */}
            <div className="hidden md:block relative">
              <img
                src={loginImage}
                alt="La Hueca del Sabor"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/40"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>La Hueca del Sabor © 2025</p>
        </div>
      </div>

      {/* Modal de Registro */}
      <Register isOpen={isRegisterOpen} onClose={closeRegister} />
    </div>
  );
};

export default Login;