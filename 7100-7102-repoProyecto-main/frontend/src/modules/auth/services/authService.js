import { post } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';

/**
 * Servicio de autenticación
 * Contiene todas las funciones relacionadas con auth
 */
const authService = {
  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Correo electrónico
   * @param {string} password - Contraseña
   * @returns {Promise<object>} - Datos del usuario y token
   */
  login: async (email, password) => {
    try {
      const response = await post(API_ENDPOINTS.LOGIN, { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Registra un nuevo usuario
   * @param {object} userData - Datos del usuario
   * @param {string} userData.nombres - Nombres completos
   * @param {string} userData.correo - Correo electrónico
   * @param {string} userData.password - Contraseña
   * @param {number} userData.role_id - ID del rol
   * @returns {Promise<object>} - Respuesta del servidor
   */
  register: async (userData) => {
    try {
      // TODO: Backend debe recibir POST /api/auth/register
      // Body: { nombres, correo, password, role_id }
      // Response: { message: "Usuario registrado. Verifica tu correo." }
      const response = await post(API_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Solicita recuperación de contraseña
   * @param {string} correo - Correo electrónico
   * @returns {Promise<object>} - Respuesta del servidor
   */
  forgotPassword: async (correo) => {
    try {
      // TODO: Backend debe recibir POST /api/auth/forgot-password
      // Body: { correo }
      // Response: { message: "Correo de recuperación enviado" }
      const response = await post(API_ENDPOINTS.FORGOT_PASSWORD, { correo });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Restablece la contraseña con token
   * @param {string} token - Token de recuperación
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<object>} - Respuesta del servidor
   */
  resetPassword: async (token, newPassword) => {
    try {
      // TODO: Backend debe recibir POST /api/auth/reset-password
      // Body: { token, newPassword }
      // Response: { message: "Contraseña restablecida exitosamente" }
      const response = await post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verifica el email con token
   * @param {string} token - Token de verificación
   * @returns {Promise<object>} - Respuesta del servidor
   */
  verifyEmail: async (token) => {
    try {
      // TODO: Backend debe recibir GET /api/auth/verify-email/:token
      // Response: { message: "Email verificado exitosamente" }
      const response = await post(`${API_ENDPOINTS.VERIFY_EMAIL}/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;