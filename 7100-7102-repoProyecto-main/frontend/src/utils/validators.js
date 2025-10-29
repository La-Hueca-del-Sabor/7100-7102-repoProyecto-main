import { REGEX, VALIDATION_MESSAGES, LIMITS } from './constants';

// ============================================
// VALIDACIONES DE CAMPOS
// ============================================

/**
 * Valida si un campo está vacío
 * @param {string} value - Valor a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateRequired = (value) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  return null;
};

/**
 * Valida formato de correo electrónico
 * @param {string} email - Email a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateEmail = (email) => {
  if (!email) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  if (!REGEX.EMAIL.test(email.trim())) {
    return VALIDATION_MESSAGES.EMAIL_INVALID;
  }
  return null;
};

/**
 * Valida contraseña (mínimo 6 caracteres, al menos una letra y un número)
 * @param {string} password - Contraseña a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePassword = (password) => {
  if (!password) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  if (password.length < LIMITS.MIN_PASSWORD_LENGTH) {
    return VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
  }
  if (!REGEX.PASSWORD.test(password)) {
    return VALIDATION_MESSAGES.PASSWORD_REQUIREMENTS;
  }
  return null;
};

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Contraseña de confirmación
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
  }
  return null;
};

/**
 * Valida nombre (solo letras y espacios)
 * @param {string} name - Nombre a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateName = (name) => {
  if (!name) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  if (!REGEX.NAME.test(name.trim())) {
    return VALIDATION_MESSAGES.NAME_INVALID;
  }
  if (name.trim().length > LIMITS.MAX_NAME_LENGTH) {
    return `El nombre no puede exceder ${LIMITS.MAX_NAME_LENGTH} caracteres`;
  }
  return null;
};

/**
 * Valida número de teléfono (10 dígitos)
 * @param {string} phone - Teléfono a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  if (!REGEX.PHONE.test(phone)) {
    return VALIDATION_MESSAGES.PHONE_INVALID;
  }
  return null;
};

/**
 * Valida que sea un número válido
 * @param {string|number} value - Valor a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return VALIDATION_MESSAGES.REQUIRED;
  }
  if (isNaN(value)) {
    return VALIDATION_MESSAGES.NUMBER_INVALID;
  }
  return null;
};

/**
 * Valida que un número sea mayor o igual a un mínimo
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo permitido
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateMin = (value, min) => {
  if (value < min) {
    return VALIDATION_MESSAGES.MIN_VALUE(min);
  }
  return null;
};

/**
 * Valida que un número sea menor o igual a un máximo
 * @param {number} value - Valor a validar
 * @param {number} max - Valor máximo permitido
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateMax = (value, max) => {
  if (value > max) {
    return VALIDATION_MESSAGES.MAX_VALUE(max);
  }
  return null;
};

/**
 * Valida longitud mínima de un string
 * @param {string} value - Valor a validar
 * @param {number} minLength - Longitud mínima
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateMinLength = (value, minLength) => {
  if (!value || value.length < minLength) {
    return `Debe tener al menos ${minLength} caracteres`;
  }
  return null;
};

/**
 * Valida longitud máxima de un string
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Longitud máxima
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateMaxLength = (value, maxLength) => {
  if (value && value.length > maxLength) {
    return `No puede exceder ${maxLength} caracteres`;
  }
  return null;
};

// ============================================
// VALIDACIONES COMPUESTAS
// ============================================

/**
 * Valida todos los campos de un formulario
 * @param {object} fields - Objeto con los campos a validar
 * @param {object} validationRules - Reglas de validación por campo
 * @returns {object} - Objeto con errores por campo
 *
 * @example
 * const errors = validateForm(
 *   { email: 'test@test.com', password: '123' },
 *   {
 *     email: [validateRequired, validateEmail],
 *     password: [validateRequired, validatePassword]
 *   }
 * );
 */
export const validateForm = (fields, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach((fieldName) => {
    const rules = validationRules[fieldName];
    const value = fields[fieldName];

    for (const rule of rules) {
      const error = rule(value, fields);
      if (error) {
        errors[fieldName] = error;
        break; // Solo mostrar el primer error por campo
      }
    }
  });

  return errors;
};

/**
 * Verifica si un formulario tiene errores
 * @param {object} errors - Objeto de errores del formulario
 * @returns {boolean} - true si hay errores, false si no
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

// ============================================
// SANITIZACIÓN DE DATOS
// ============================================

/**
 * Limpia espacios en blanco de un string
 * @param {string} value - String a limpiar
 * @returns {string} - String limpio
 */
export const sanitizeString = (value) => {
  return value ? value.trim() : '';
};

/**
 * Limpia y convierte a minúsculas un email
 * @param {string} email - Email a limpiar
 * @returns {string} - Email limpio
 */
export const sanitizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : '';
};

/**
 * Limpia un número de teléfono (solo dígitos)
 * @param {string} phone - Teléfono a limpiar
 * @returns {string} - Teléfono limpio
 */
export const sanitizePhone = (phone) => {
  return phone ? phone.replace(/\D/g, '') : '';
};

/**
 * Limpia un nombre (solo letras, espacios y acentos)
 * @param {string} name - Nombre a limpiar
 * @returns {string} - Nombre limpio
 */
export const sanitizeName = (name) => {
  return name ? name.replace(/[^A-Za-zÀ-ÿÑñ\s]/g, '') : '';
};

/**
 * Convierte un valor a número o devuelve 0
 * @param {string|number} value - Valor a convertir
 * @returns {number} - Número convertido
 */
export const toNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// ============================================
// VALIDACIONES ESPECÍFICAS DEL NEGOCIO
// ============================================

/**
 * Valida que la cantidad de un producto sea válida
 * @param {number} cantidad - Cantidad a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateCantidad = (cantidad) => {
  const errorRequired = validateRequired(cantidad);
  if (errorRequired) return errorRequired;

  const errorNumber = validateNumber(cantidad);
  if (errorNumber) return errorNumber;

  const errorMin = validateMin(cantidad, 1);
  if (errorMin) return errorMin;

  return null;
};

/**
 * Valida que el precio sea válido
 * @param {number} precio - Precio a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validatePrecio = (precio) => {
  const errorRequired = validateRequired(precio);
  if (errorRequired) return errorRequired;

  const errorNumber = validateNumber(precio);
  if (errorNumber) return errorNumber;

  const errorMin = validateMin(precio, 0);
  if (errorMin) return errorMin;

  return null;
};

/**
 * Valida selección de rol
 * @param {string|number} roleId - ID del rol
 * @returns {string|null} - Mensaje de error o null si es válido
 */
export const validateRoleId = (roleId) => {
  if (!roleId || roleId === '' || roleId === '0') {
    return 'Debe seleccionar un rol';
  }
  return null;
};

// Export de todas las funciones
export default {
  validateRequired,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validatePhone,
  validateNumber,
  validateMin,
  validateMax,
  validateMinLength,
  validateMaxLength,
  validateForm,
  hasErrors,
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
  toNumber,
  validateCantidad,
  validatePrecio,
  validateRoleId,
};