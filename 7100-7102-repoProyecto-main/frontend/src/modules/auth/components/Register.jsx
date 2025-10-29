import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Componentes
import { Button, Input, Alert, Modal } from '../../../components/common';

// Hooks
import { useForm } from '../../../hooks';

// Servicios
import authService from '../services/authService';

// Utilidades
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateRoleId,
  sanitizeName,
  sanitizeEmail,
} from '../../../utils/validators';

/**
 * Componente Register - Modal de registro
 * @param {object} props - Propiedades
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {function} props.onClose - Función para cerrar el modal
 */
const Register = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reglas de validación
  const validationRules = {
    nombres: [validateRequired, validateName],
    correo: [validateRequired, validateEmail],
    password: [validateRequired, validatePassword],
    confirmPassword: [
      validateRequired,
      (value, values) => validatePasswordMatch(values.password, value),
    ],
    role_id: [validateRoleId],
  };

  // Función onSubmit
  const handleRegister = async (values) => {
    setBackendError('');
    setSuccessMessage('');

    try {
      // Sanitizar datos
      const userData = {
        nombres: sanitizeName(values.nombres),
        correo: sanitizeEmail(values.correo),
        password: values.password,
        role_id: parseInt(values.role_id),
      };

      // Llamar al servicio de registro
      const response = await authService.register(userData);

      // Mostrar mensaje de éxito
      setSuccessMessage(response.message || 'Registro exitoso. Verifica tu correo electrónico.');
      toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.');

      // Limpiar formulario y cerrar modal después de 3 segundos
      setTimeout(() => {
        reset();
        onClose();
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error en registro:', error);

      if (error.response?.data?.error) {
        setBackendError(error.response.data.error);
      } else {
        setBackendError('Error al registrar usuario. Intenta nuevamente.');
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
  } = useForm(
    {
      nombres: '',
      correo: '',
      password: '',
      confirmPassword: '',
      role_id: '',
    },
    validationRules,
    handleRegister
  );

  // Manejar cambio de nombre (solo letras y espacios)
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-zÀ-ÿÑñ\s]/g, '');
    handleInputChange({ target: { name: 'nombres', value } });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro de Usuario"
      size="lg"
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombres */}
        <Input
          label="Nombres Completos"
          name="nombres"
          type="text"
          placeholder="Ingrese sus nombres"
          value={values.nombres}
          onChange={handleNameChange}
          onBlur={handleInputBlur}
          error={errors.nombres}
          leftIcon={<FaUser className="text-gray-400" />}
          helperText="Solo se permiten letras y espacios"
          required
        />

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
          required
        />

        {/* Contraseña */}
        <Input
          label="Contraseña"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
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
          helperText="Debe contener al menos una letra y un número"
          required
        />

        {/* Confirmar Contraseña */}
        <Input
          label="Confirmar Contraseña"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Repite tu contraseña"
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

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Rol <span className="text-danger-500">*</span>
          </label>
          <select
            name="role_id"
            value={values.role_id}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`w-full px-4 py-2.5 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
              errors.role_id
                ? 'border-danger-500 focus:ring-danger-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-transparent'
            }`}
          >
            <option value="">Seleccione un rol</option>
            <option value="2">Mesero</option>
            <option value="3">Cocinero</option>
            <option value="4">Cajero</option>
          </select>
          {errors.role_id && (
            <p className="mt-1.5 text-sm text-danger-600">{errors.role_id}</p>
          )}
        </div>

        {/* Error del backend */}
        {backendError && (
          <Alert variant="danger" dismissible onClose={() => setBackendError('')}>
            {backendError}
          </Alert>
        )}

        {/* Mensaje de éxito */}
        {successMessage && (
          <Alert variant="success">
            {successMessage}
          </Alert>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            fullWidth
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={successMessage !== ''}
            fullWidth
          >
            Registrarse
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default Register;