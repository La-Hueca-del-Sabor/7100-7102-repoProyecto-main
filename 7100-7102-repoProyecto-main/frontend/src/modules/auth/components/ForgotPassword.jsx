import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Componentes
import { Button, Input, Alert } from '../../../components/common';

// Hooks
import { useForm } from '../../../hooks';

// Servicios
import authService from '../services/authService';

// Utilidades
import { validateEmail, sanitizeEmail } from '../../../utils/validators';
import { ROUTES } from '../../../utils/constants';

// Assets
import loginImage from '../../../assets/login.jpg';

const ForgotPassword = () => {
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reglas de validación
  const validationRules = {
    correo: [validateEmail],
  };

  // Función onSubmit
  const handleForgotPassword = async (values) => {
    setBackendError('');
    setSuccessMessage('');

    try {
      // Sanitizar email
      const correo = sanitizeEmail(values.correo);

      // Llamar al servicio
      const response = await authService.forgotPassword(correo);

      // Mostrar mensaje de éxito
      setSuccessMessage(
        response.message ||
        'Se ha enviado un correo con instrucciones para recuperar tu contraseña.'
      );
      toast.success('Correo de recuperación enviado exitosamente');

      // Limpiar el campo de correo
      reset();
    } catch (error) {
      console.error('Error en forgot password:', error);

      if (error.response?.data?.error) {
        setBackendError(error.response.data.error);
      } else {
        setBackendError('Error al procesar la solicitud. Intenta nuevamente.');
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
    reset,
  } = useForm({ correo: '' }, validationRules, handleForgotPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-2xl shadow-hard overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Formulario */}
            <div className="p-8 md:p-12">
              <div className="max-w-md mx-auto">
                {/* Botón volver */}
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                  <FaArrowLeft />
                  <span>Volver al inicio de sesión</span>
                </Link>

                {/* Título */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Recuperar Contraseña
                  </h1>
                  <p className="text-gray-600">
                    Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                  </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <Input
                    label="Correo Electrónico"
                    name="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={values.correo}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    error={errors.correo}
                    leftIcon={<FaEnvelope className="text-gray-400" />}
                    helperText="Ingresa el correo asociado a tu cuenta"
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
                          Revisa tu bandeja de entrada y sigue las instrucciones del correo.
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
                    Enviar Enlace de Recuperación
                  </Button>

                  {/* Volver al login */}
                  <div className="text-center">
                    <Link
                      to={ROUTES.LOGIN}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      ¿Recordaste tu contraseña? <span className="font-semibold">Inicia sesión</span>
                    </Link>
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
    </div>
  );
};

export default ForgotPassword;