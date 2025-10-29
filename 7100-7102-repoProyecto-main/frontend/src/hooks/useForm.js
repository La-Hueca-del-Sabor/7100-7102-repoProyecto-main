import { useState, useCallback } from 'react';
import { validateForm, hasErrors as checkErrors } from '../utils/validators';

/**
 * Hook personalizado para gestionar formularios
 * @param {object} initialValues - Valores iniciales del formulario
 * @param {object} validationRules - Reglas de validación por campo
 * @param {function} onSubmit - Función a ejecutar al enviar el formulario
 * @returns {object} - Estado y funciones del formulario
 */
const useForm = (initialValues = {}, validationRules = {}, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el cambio de un campo
   * @param {string} name - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Maneja el evento onChange de un input
   * @param {Event} e - Evento del input
   */
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    handleChange(name, newValue);
  }, [handleChange]);

  /**
   * Marca un campo como tocado (blur)
   * @param {string} name - Nombre del campo
   */
  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validar el campo individual al hacer blur
    if (validationRules[name]) {
      const fieldRules = validationRules[name];
      for (const rule of fieldRules) {
        const error = rule(values[name], values);
        if (error) {
          setErrors((prev) => ({
            ...prev,
            [name]: error,
          }));
          break;
        }
      }
    }
  }, [values, validationRules]);

  /**
   * Maneja el evento onBlur de un input
   * @param {Event} e - Evento del input
   */
  const handleInputBlur = useCallback((e) => {
    const { name } = e.target;
    handleBlur(name);
  }, [handleBlur]);

  /**
   * Establece el valor de un campo específico
   * @param {string} name - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const setValue = useCallback((name, value) => {
    handleChange(name, value);
  }, [handleChange]);

  /**
   * Establece múltiples valores a la vez
   * @param {object} newValues - Objeto con los nuevos valores
   */
  const setFieldValues = useCallback((newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Establece un error para un campo específico
   * @param {string} name - Nombre del campo
   * @param {string} error - Mensaje de error
   */
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Establece múltiples errores a la vez
   * @param {object} newErrors - Objeto con los errores
   */
  const setFieldErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} - True si el formulario es válido
   */
  const validate = useCallback(() => {
    const formErrors = validateForm(values, validationRules);
    setErrors(formErrors);
    return !checkErrors(formErrors);
  }, [values, validationRules]);

  /**
   * Resetea el formulario a sus valores iniciales
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Limpia todos los errores
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Maneja el envío del formulario
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validar formulario
    const isValid = validate();

    if (isValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Error en onSubmit:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  /**
   * Verifica si un campo tiene error y ha sido tocado
   * @param {string} name - Nombre del campo
   * @returns {boolean} - True si tiene error visible
   */
  const hasError = useCallback((name) => {
    return touched[name] && !!errors[name];
  }, [touched, errors]);

  /**
   * Obtiene el mensaje de error de un campo
   * @param {string} name - Nombre del campo
   * @returns {string|null} - Mensaje de error o null
   */
  const getError = useCallback((name) => {
    return hasError(name) ? errors[name] : null;
  }, [hasError, errors]);

  return {
    // Estado
    values,
    errors,
    touched,
    isSubmitting,
    isValid: !checkErrors(errors),

    // Funciones de cambio
    handleChange,
    handleInputChange,
    handleBlur,
    handleInputBlur,
    setValue,
    setFieldValues,

    // Funciones de error
    setFieldError,
    setFieldErrors,
    clearErrors,
    hasError,
    getError,

    // Funciones de control
    validate,
    reset,
    handleSubmit,
  };
};

export default useForm;