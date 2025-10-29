import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Componentes
import { Button, Spinner, Alert } from '../../../components/common';

// Servicios
import authService from '../services/authService';

// Utilidades
import { ROUTES } from '../../../utils/constants';

const EmailVerification = () => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Obtener el token de la URL
        const token = window.location.pathname.split('/verify-email/')[1];

        console.log('Token a verificar:', token);

        if (!token) {
          setStatus('error');
          setMessage('Token de verificación no proporcionado');
          return;
        }

        // TODO: Backend debe implementar GET /api/auth/verify-email/:token
        // Response: { message: "Email verificado exitosamente" }
        const response = await authService.verifyEmail(token);

        console.log('Respuesta del servidor:', response);

        setStatus('success');
        setMessage(response.message || 'Email verificado exitosamente');
      } catch (error) {
        console.error('Error al verificar:', error);
        setStatus('error');

        if (error.response?.data?.error) {
          setMessage(error.response.data.error);
        } else {
          setMessage('Error al verificar el correo electrónico');
        }
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-hard p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Verificación de Correo
          </h1>

          {/* Estado: Verificando */}
          {status === 'verifying' && (
            <div className="space-y-4">
              <Spinner size="xl" />
              <p className="text-gray-600">
                Verificando tu correo electrónico...
              </p>
            </div>
          )}

          {/* Estado: Éxito */}
          {status === 'success' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-success-500 text-4xl" />
                </div>
              </div>

              <Alert variant="success">
                <p className="font-semibold">{message}</p>
              </Alert>

              <p className="text-gray-600">
                Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
              </p>

              <Link to={ROUTES.LOGIN}>
                <Button variant="primary" size="lg" fullWidth>
                  Ir al inicio de sesión
                </Button>
              </Link>
            </div>
          )}

          {/* Estado: Error */}
          {status === 'error' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-danger-100 rounded-full flex items-center justify-center">
                  <FaTimesCircle className="text-danger-500 text-4xl" />
                </div>
              </div>

              <Alert variant="danger">
                <p className="font-semibold">{message}</p>
              </Alert>

              <p className="text-gray-600">
                El enlace de verificación puede haber expirado o ser inválido.
              </p>

              <Link to={ROUTES.LOGIN}>
                <Button variant="primary" size="lg" fullWidth>
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>La Hueca del Sabor © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;