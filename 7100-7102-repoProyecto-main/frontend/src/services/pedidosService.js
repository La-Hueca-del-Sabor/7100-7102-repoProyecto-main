import { get, post, put, del } from './api/apiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio para gestión de pedidos
 */
const pedidosService = {
  /**
   * Obtiene todos los pedidos (con filtros opcionales)
   * @param {object} filters - Filtros opcionales
   * @param {string} filters.estado - Estado del pedido
   * @param {string} filters.fecha - Fecha del pedido
   * @returns {Promise<Array>} - Lista de pedidos
   */
  getAll: async (filters = {}) => {
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.fecha) params.append('fecha', filters.fecha);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await get(`${API_ENDPOINTS.PEDIDOS}${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene un pedido por ID
   * @param {number} id - ID del pedido
   * @returns {Promise<object>} - Datos del pedido
   */
  getById: async (id) => {
    try {
      const response = await get(API_ENDPOINTS.PEDIDO_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene los detalles de un pedido
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<Array>} - Detalles del pedido
   */
  getDetalles: async (pedidoId) => {
    try {
      const response = await get(`${API_ENDPOINTS.PEDIDOS_DETALLES}?pedido_id=${pedidoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crea un nuevo pedido
   * @param {object} pedidoData - Datos del pedido
   * @param {number} pedidoData.usuario_id - ID del usuario (mesero)
   * @param {number} pedidoData.estado_id - ID del estado
   * @param {Array} pedidoData.detalles - Array de productos con cantidades
   * @returns {Promise<object>} - Pedido creado
   */
  create: async (pedidoData) => {
    try {
      // TODO: Backend debe recibir POST /api/pedidos
      // Body: { usuario_id, estado_id, detalles: [{ producto_id, cantidad, precio }] }
      // Response: { pedido_id, numero_pedido, created_at, detalles }
      const response = await post(API_ENDPOINTS.CREAR_PEDIDO, pedidoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualiza el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {number} estadoId - Nuevo estado ID
   * @returns {Promise<object>} - Pedido actualizado
   */
  updateEstado: async (id, estadoId) => {
    try {
      // TODO: Backend debe recibir PUT /api/pedidos/:id/estado
      // Body: { estado_id }
      const response = await put(`${API_ENDPOINTS.PEDIDO_BY_ID(id)}/estado`, {
        estado_id: estadoId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancela un pedido
   * @param {number} id - ID del pedido
   * @returns {Promise<object>} - Respuesta del servidor
   */
  cancel: async (id) => {
    try {
      // TODO: Backend debe recibir PUT /api/pedidos/:id/cancelar
      const response = await put(`${API_ENDPOINTS.PEDIDO_BY_ID(id)}/cancelar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Marca un pedido como entregado
   * @param {number} id - ID del pedido
   * @returns {Promise<object>} - Respuesta del servidor
   */
  marcarEntregado: async (id) => {
    try {
      // TODO: Backend debe recibir PUT /api/pedidos/:id/entregar
      const response = await put(`${API_ENDPOINTS.PEDIDO_BY_ID(id)}/entregar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Elimina un pedido (solo para admin)
   * @param {number} id - ID del pedido
   * @returns {Promise<object>} - Respuesta del servidor
   */
  delete: async (id) => {
    try {
      const response = await del(API_ENDPOINTS.PEDIDO_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene pedidos activos (pendientes + en proceso)
   * @returns {Promise<Array>} - Lista de pedidos activos
   */
  getActivos: async () => {
    try {
      // TODO: Backend debe implementar este filtro o hacerlo en frontend
      const response = await get(`${API_ENDPOINTS.PEDIDOS}?activos=true`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene pedidos listos para entrega
   * @returns {Promise<Array>} - Lista de pedidos listos
   */
  getListos: async () => {
    try {
      const response = await get(`${API_ENDPOINTS.PEDIDOS}?estado=listo`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default pedidosService;