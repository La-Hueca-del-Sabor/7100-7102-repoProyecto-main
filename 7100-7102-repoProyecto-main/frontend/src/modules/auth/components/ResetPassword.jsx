import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Componentes
import { Button, Input, Alert } from '../../../components/common';

// Hooks
import { useForm } from '../../../hooks';

// Servicios
import authService from '../services/authService';

// Utilidades
import {
  validatePassword,
  validatePasswordMatch
} from '../../../utils/validators';
import { ROUTES } from '../../../utils/constants';

// Assets
import loginImage from '../../../assets/login.jpg';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reglas de validación
  const validationRules = {
    newPassword: [validatePassword],
    confirmPassword: [
      (value, values) => validatePasswordMatch(values.newPassword, value),
    ],
  };

  // Función onSubmit
  const handleResetPassword = async (values) => {
    setBackendError('');
    setSuccessMessage('');

    try {
      // Llamar al servicio
      const response = await authService.resetPassword(token, values.newPassword);

      // Mostrar mensaje de éxito
      setSuccessMessage(
        response.message || 'Contraseña restablecida exitosamente'
      );
      toast.success('¡Contraseña actualizada! Redirigiendo al login...');

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (error) {
      console.error('Error en reset password:', error);

      if (error.response?.data?.error) {
        setBackendError(error.response.data.error);
      } else {
        setBackendError('Error al restablecer la contraseña. El enlace puede haber expirado.');
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
    { newPassword: '', confirmPassword: '' },
    validationRules,
    handleResetPassword
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-hard overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Formulario */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                {/* Título */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Restablecer Contraseña
                  </h1>
                  <p className="text-gray-600">
                    Ingresa tu nueva contraseña a continuación.
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nueva Contraseña */}
                  <Input
                    label="Nueva Contraseña"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={values.newPassword}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.newPassword}
                    leftIcon={<FaLock className="text-gray-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                      </button>
                    }
                    helperText="Debe contener al menos una letra y un número"
                    required
                  />

                  {/* Confirmar Contraseña */}
                  <Input
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu nueva contraseña"
                    value={values.confirmPassword}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.confirmPassword}
                    leftIcon={<FaLock className="text-gray-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
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

                  {/* Mensaje de éxito */}
                  {successMessage && (
                    <Alert variant="success">
                      <div className="space-y-2">
                        <p className="font-semibold">{successMessage}</p>
                        <p className="text-sm">
                          Serás redirigido al inicio de sesión en breve...
                        </p>
                      </div>
                    </Alert>
                  )}

                  {/* Botón de envío */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={successMessage !== ''}
                  >
                    Restablecer Contraseña
                  </Button>
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
    </div>
  );
};

export default ResetPassword;