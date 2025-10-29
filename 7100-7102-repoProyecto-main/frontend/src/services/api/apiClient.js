import axios from 'axios';
import toast from 'react-hot-toast';

// Configuración base del cliente API
const apiClient = axios.create({
  baseURL: 'http://localhost:3002/api', // TODO: Conectar con variable de entorno process.env.REACT_APP_API_URL
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// INTERCEPTOR DE SOLICITUDES (Request)
// ============================================
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');

    // Si existe token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log de debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPUESTAS (Response)
// ============================================
apiClient.interceptors.response.use(
  (response) => {
    // Log de debug en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Manejo centralizado de errores
    const { response, message } = error;

    // Si no hay respuesta del servidor (red caída, timeout, etc.)
    if (!response) {
      console.error('❌ Error de red:', message);
      toast.error('Error de conexión. Verifica tu internet.');
      return Promise.reject(error);
    }

    // Manejo según código de estado HTTP
    switch (response.status) {
      case 400:
        // Bad Request - Error de validación
        console.error('❌ Error 400:', response.data);
        toast.error(response.data.error || 'Datos inválidos');
        break;

      case 401:
        // Unauthorized - Token inválido o expirado
        console.error('❌ Error 401: No autorizado');
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');

        // Limpiar localStorage y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('authData');

        // TODO: Redirigir al login (se hará desde un hook useAuth)
        window.location.href = '/login';
        break;

      case 403:
        // Forbidden - Sin permisos
        console.error('❌ Error 403: Acceso denegado');
        toast.error('No tienes permisos para realizar esta acción');
        break;

      case 404:
        // Not Found
        console.error('❌ Error 404:', response.config.url);
        toast.error('Recurso no encontrado');
        break;

      case 409:
        // Conflict - Duplicados, etc.
        console.error('❌ Error 409:', response.data);
        toast.error(response.data.error || 'Conflicto en la operación');
        break;

      case 422:
        // Unprocessable Entity - Error de validación semántica
        console.error('❌ Error 422:', response.data);
        toast.error(response.data.error || 'Error de validación');
        break;

      case 500:
        // Internal Server Error
        console.error('❌ Error 500:', response.data);
        toast.error('Error del servidor. Intenta más tarde.');
        break;

      case 503:
        // Service Unavailable
        console.error('❌ Error 503: Servicio no disponible');
        toast.error('Servicio temporalmente no disponible');
        break;

      default:
        console.error('❌ Error desconocido:', response.status, response.data);
        toast.error('Ocurrió un error inesperado');
    }

    return Promise.reject(error);
  }
);

// ============================================
// MÉTODOS AUXILIARES
// ============================================

/**
 * Realiza una petición GET
 * @param {string} url - Endpoint relativo
 * @param {object} config - Configuración adicional de Axios
 * @returns {Promise}
 */
export const get = (url, config = {}) => {
  return apiClient.get(url, config);
};

/**
 * Realiza una petición POST
 * @param {string} url - Endpoint relativo
 * @param {object} data - Datos a enviar
 * @param {object} config - Configuración adicional de Axios
 * @returns {Promise}
 */
export const post = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

/**
 * Realiza una petición PUT
 * @param {string} url - Endpoint relativo
 * @param {object} data - Datos a actualizar
 * @param {object} config - Configuración adicional de Axios
 * @returns {Promise}
 */
export const put = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

/**
 * Realiza una petición PATCH
 * @param {string} url - Endpoint relativo
 * @param {object} data - Datos parciales a actualizar
 * @param {object} config - Configuración adicional de Axios
 * @returns {Promise}
 */
export const patch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

/**
 * Realiza una petición DELETE
 * @param {string} url - Endpoint relativo
 * @param {object} config - Configuración adicional de Axios
 * @returns {Promise}
 */
export const del = (url, config = {}) => {
  return apiClient.delete(url, config);
};

/**
 * Configura el token de autenticación
 * @param {string} token - Token JWT
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Limpia el token de autenticación
 */
export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('authData');
  delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Obtiene el rol del usuario autenticado
 * @returns {string|null}
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};

/**
 * Obtiene los datos de autenticación del usuario
 * @returns {object|null}
 */
export const getAuthData = () => {
  const data = localStorage.getItem('authData');
  return data ? JSON.parse(data) : null;
};

// Export por defecto
export default apiClient;