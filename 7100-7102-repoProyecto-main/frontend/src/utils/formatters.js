import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_FORMATS } from './constants';

// ============================================
// FORMATEO DE FECHAS
// ============================================

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado (por defecto: dd/MM/yyyy HH:mm)
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, formatStr = DATE_FORMATS.FULL) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '-';
  }
};
/**
 * Formatea fecha a solo fecha (sin hora)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada (dd/MM/yyyy)
 */
export const formatDateOnly = (date) => {
  return formatDate(date, DATE_FORMATS.DATE_ONLY);
};
/**
 * Formatea fecha a solo hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Hora formateada (HH:mm)
 */
export const formatTimeOnly = (date) => {
  return formatDate(date, DATE_FORMATS.TIME_ONLY);
};
// Alias para mantener compatibilidad con código existente
export const formatTime = formatTimeOnly;

/**
 * Obtiene fecha relativa (hace X minutos, hace X horas, etc.)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha relativa
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInMs = now - dateObj;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return formatDateOnly(date);
  } catch (error) {
    console.error('Error al formatear fecha relativa:', error);
    return '-';
  }
};

// ============================================
// FORMATEO DE NÚMEROS Y MONEDA
// ============================================

/**
 * Formatea un número a moneda (USD)
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (por defecto: USD)
 * @returns {string} - Moneda formateada
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @param {number} decimals - Cantidad de decimales (por defecto: 0)
 * @returns {string} - Número formateado
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Formatea porcentaje
 * @param {number} value - Valor entre 0 y 1 (o 0 y 100)
 * @param {boolean} isDecimal - Si el valor está en formato decimal (0.5) o porcentual (50)
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const percentage = isDecimal ? value * 100 : value;
  return `${formatNumber(percentage, 1)}%`;
};

// ============================================
// FORMATEO DE TEXTO
// ============================================

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} - String capitalizado
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convierte un string a formato título (capitaliza cada palabra)
 * @param {string} str - String a convertir
 * @returns {string} - String en formato título
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo a agregar (por defecto: '...')
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Convierte un string a slug (URL-friendly)
 * @param {string} str - String a convertir
 * @returns {string} - Slug
 */
export const toSlug = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final
};

// ============================================
// FORMATEO DE DATOS ESPECÍFICOS
// ============================================

/**
 * Formatea número de teléfono (formato: 099-123-4567)
 * @param {string} phone - Teléfono a formatear
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Formatea cédula ecuatoriana (formato: 1234567890)
 * @param {string} cedula - Cédula a formatear
 * @returns {string} - Cédula formateada
 */
export const formatCedula = (cedula) => {
  if (!cedula) return '-';
  const cleaned = cedula.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 8)}-${cleaned.slice(8)}`;
  }
  return cedula;
};

/**
 * Formatea nombre de archivo (elimina espacios y caracteres especiales)
 * @param {string} filename - Nombre de archivo
 * @returns {string} - Nombre de archivo formateado
 */
export const formatFilename = (filename) => {
  if (!filename) return '';
  const nameParts = filename.split('.');
  const extension = nameParts.pop();
  const name = nameParts.join('.');
  const cleanName = toSlug(name);
  return `${cleanName}.${extension}`;
};

// ============================================
// FORMATEO DE ESTADOS
// ============================================

/**
 * Obtiene el color asociado a un estado de pedido
 * @param {string} estado - Estado del pedido
 * @returns {string} - Clase de color de Tailwind
 */
export const getEstadoColor = (estado) => {
  const colors = {
    pendiente: 'text-warning-600 bg-warning-50',
    en_proceso: 'text-info-600 bg-info-50',
    listo: 'text-success-600 bg-success-50',
    entregado: 'text-secondary-600 bg-secondary-50',
    cancelado: 'text-danger-600 bg-danger-50',
  };
  return colors[estado] || 'text-gray-600 bg-gray-50';
};

/**
 * Obtiene el badge de estado formateado
 * @param {string} estado - Estado del pedido
 * @returns {object} - Objeto con label y colorClass
 */
export const getEstadoBadge = (estado) => {
  const labels = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  return {
    label: labels[estado] || capitalize(estado),
    colorClass: getEstadoColor(estado),
  };
};

// ============================================
// FORMATEO DE ARRAYS
// ============================================

/**
 * Une un array de strings con comas y "y" antes del último elemento
 * @param {string[]} array - Array a unir
 * @returns {string} - String unido
 * @example joinWithAnd(['manzana', 'pera', 'uva']) => 'manzana, pera y uva'
 */
export const joinWithAnd = (array) => {
  if (!array || array.length === 0) return '';
  if (array.length === 1) return array[0];
  if (array.length === 2) return `${array[0]} y ${array[1]}`;

  const allButLast = array.slice(0, -1).join(', ');
  const last = array[array.length - 1];
  return `${allButLast} y ${last}`;
};

// ============================================
// FORMATEO DE TAMAÑO DE ARCHIVO
// ============================================

/**
 * Formatea el tamaño de archivo en bytes a formato legible
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado (ej: 1.5 MB)
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Export por defecto
export default {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  capitalize,
  toTitleCase,
  truncateText,
  toSlug,
  formatPhone,
  formatCedula,
  formatFilename,
  getEstadoColor,
  getEstadoBadge,
  joinWithAnd,
  formatFileSize,
};