// ============================================
// ROLES DE USUARIO
// ============================================
export const ROLES = {
  GERENTE: 'gerente',
  MESERO: 'mesero',
  COCINA: 'cocina',
  CAJA: 'caja',
};

export const ROLE_IDS = {
  GERENTE: 1,
  MESERO: 2,
  COCINA: 3,
  CAJA: 4,
};

// ============================================
// ESTADOS DE PEDIDOS
// ============================================
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  LISTO: 'listo',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
};

export const ESTADOS_PEDIDO_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ESTADOS_PEDIDO_COLORS = {
  pendiente: 'warning',
  en_proceso: 'info',
  listo: 'success',
  entregado: 'secondary',
  cancelado: 'danger',
};

// Alias para uso simplificado
export const ESTADOS = {
  PEDIDO: ESTADOS_PEDIDO,
};
// ============================================
// MÉTODOS DE PAGO
// ============================================
export const METODOS_PAGO = {
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
};

export const METODOS_PAGO_LABELS = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

// ============================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// ============================================
// RUTAS DE NAVEGACIÓN
// ============================================
export const ROUTES = {
  // Públicas
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',

  // Privadas - Mesero
  MESERO_DASHBOARD: '/mesero',
  MESERO_PEDIDOS: '/mesero/pedidos',
  MESERO_NUEVO_PEDIDO: '/mesero/pedidos/nuevo',

  // Privadas - Cocina
  COCINA_DASHBOARD: '/cocina',
  COCINA_PEDIDOS: '/cocina/pedidos',

  // Privadas - Caja
  CAJA_DASHBOARD: '/caja',
  CAJA_PEDIDOS: '/caja/pedidos',
  CAJA_COMPROBANTES: '/caja/comprobantes',

  // Privadas - Gerencia
  GERENCIA_DASHBOARD: '/gerencia',
  GERENCIA_REPORTES: '/gerencia/reportes',
  GERENCIA_DISPONIBILIDAD: '/gerencia/disponibilidad',
  GERENCIA_USUARIOS: '/gerencia/usuarios',
};

// ============================================
// ENDPOINTS DE LA API
// ============================================
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',

  // Pedidos
  PEDIDOS: '/pedidos', // TODO: Backend debe implementar /api/pedidos
  PEDIDOS_DETALLES: '/pedidos-detalles', // TODO: Backend ya tiene este endpoint
  PEDIDO_BY_ID: (id) => `/pedidos/${id}`, // TODO: Backend debe implementar GET /api/pedidos/:id
  CREAR_PEDIDO: '/pedidos', // TODO: Backend debe implementar POST /api/pedidos

  // Productos
  PRODUCTOS: '/productos', // TODO: Backend debe implementar /api/productos
  PRODUCTO_BY_ID: (id) => `/productos/${id}`, // TODO: Backend debe implementar GET /api/productos/:id
  DISPONIBILIDAD: '/productos/disponibilidad', // TODO: Backend debe implementar para actualizar stock diario

  // Dashboard (Gerencia)
  DASHBOARD_VENTAS: '/dashboard/ventas', // TODO: Backend ya tiene este endpoint
  DASHBOARD_HORARIOS: '/dashboard/horarios', // TODO: Backend ya tiene este endpoint
  DASHBOARD_INGRESOS: '/dashboard/ingresos', // TODO: Backend ya tiene este endpoint
  DASHBOARD_METODO_PAGO: '/dashboard/ingresos-metodo-pago', // TODO: Backend ya tiene este endpoint

  // Reportes
  REPORTES_PEDIDOS: '/reportes/pedidos', // TODO: Backend ya tiene este endpoint
  REPORTES_VENTAS: '/reportes/ventas', // TODO: Backend ya tiene este endpoint
  REPORTES_USUARIOS: '/reportes/usuarios', // TODO: Backend ya tiene este endpoint

  // Estados y métodos de pago
  ESTADOS: '/estados', // TODO: Backend ya tiene este endpoint
  METODOS_PAGO_API: '/metodos-pago', // TODO: Backend ya tiene este endpoint

  // Chatbot (NUEVO - Sprint 3)
  CHATBOT_QUERY: '/chatbot/query', // TODO: Backend debe implementar en Sprint 3
  CHATBOT_FEEDBACK: '/chatbot/feedback', // TODO: Backend debe implementar en Sprint 3
};

// ============================================
// MENSAJES DE VALIDACIÓN
// ============================================
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  EMAIL_INVALID: 'Ingrese un correo electrónico válido',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  PASSWORD_REQUIREMENTS: 'La contraseña debe tener al menos una letra y un número',
  PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
  NAME_INVALID: 'Solo se permiten letras y espacios',
  PHONE_INVALID: 'Ingrese un teléfono válido',
  NUMBER_INVALID: 'Ingrese un número válido',
  MIN_VALUE: (min) => `El valor mínimo es ${min}`,
  MAX_VALUE: (max) => `El valor máximo es ${max}`,
};

// ============================================
// MENSAJES DE NOTIFICACIÓN
// ============================================
export const TOAST_MESSAGES = {
  // Éxito
  LOGIN_SUCCESS: 'Bienvenido de nuevo',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  REGISTER_SUCCESS: 'Registro exitoso. Verifica tu correo.',
  UPDATE_SUCCESS: 'Actualización exitosa',
  DELETE_SUCCESS: 'Eliminado correctamente',
  SAVE_SUCCESS: 'Guardado correctamente',

  // Errores
  LOGIN_ERROR: 'Credenciales incorrectas',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  GENERIC_ERROR: 'Ocurrió un error. Intenta nuevamente.',

  // Pedidos
  PEDIDO_CREATED: 'Pedido creado exitosamente',
  PEDIDO_UPDATED: 'Pedido actualizado',
  PEDIDO_CANCELLED: 'Pedido cancelado',

  // Productos
  PRODUCTO_CREATED: 'Producto creado exitosamente',
  PRODUCTO_UPDATED: 'Producto actualizado',
  DISPONIBILIDAD_UPDATED: 'Disponibilidad actualizada',
};

// ============================================
// FORMATO DE FECHAS
// ============================================
export const DATE_FORMATS = {
  FULL: 'dd/MM/yyyy HH:mm:ss',
  DATE_ONLY: 'dd/MM/yyyy',
  TIME_ONLY: 'HH:mm',
  SHORT: 'dd/MM/yy',
  MONTH_YEAR: 'MMMM yyyy',
};

// ============================================
// CONFIGURACIÓN GENERAL
// ============================================
export const APP_CONFIG = {
  APP_NAME: 'La Hueca del Sabor',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'soporte@lahuecadelsabor.com',
  TIMEOUT: 10000, // 10 segundos
};

// ============================================
// EXPRESIONES REGULARES
// ============================================
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/,
  NAME: /^[A-Za-zÀ-ÿÑñ\s]+$/,
  PHONE: /^[0-9]{10}$/,
  ONLY_NUMBERS: /^[0-9]+$/,
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,
};

// ============================================
// TIEMPOS DE ESPERA
// ============================================
export const TIMEOUTS = {
  TOAST_DURATION: 3000, // 3 segundos
  DEBOUNCE_SEARCH: 500, // 500ms
  POLLING_INTERVAL: 30000, // 30 segundos (para actualizar pedidos)
  SESSION_TIMEOUT: 3600000, // 1 hora
};

// ============================================
// LÍMITES
// ============================================
export const LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
};