import { get, post } from './api/apiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio para gestión de comprobantes
 */
const comprobantesService = {
  /**
   * Obtiene todos los comprobantes
   * @param {object} filters - Filtros opcionales
   * @param {string} filters.fecha - Fecha del comprobante
   * @param {number} filters.pedido_id - ID del pedido
   * @returns {Promise<Array>} - Lista de comprobantes
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.fecha) params.append('fecha', filters.fecha);
      if (filters.pedido_id) params.append('pedido_id', filters.pedido_id);

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await get(`${API_ENDPOINTS.COMPROBANTES}${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene un comprobante por ID
   * @param {number} id - ID del comprobante
   * @returns {Promise<object>} - Datos del comprobante
   */
  getById: async (id) => {
    try {
      const response = await get(`${API_ENDPOINTS.COMPROBANTES}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crea un nuevo comprobante
   * @param {object} comprobanteData - Datos del comprobante
   * @param {number} comprobanteData.pedido_id - ID del pedido
   * @param {string} comprobanteData.cliente_nombre - Nombre del cliente
   * @param {string} comprobanteData.cliente_cedula - Cédula/RUC del cliente
   * @param {string} comprobanteData.cliente_direccion - Dirección
   * @param {string} comprobanteData.cliente_telefono - Teléfono
   * @param {string} comprobanteData.metodo_pago - Método de pago
   * @param {number} comprobanteData.total - Total del comprobante
   * @returns {Promise<object>} - Comprobante creado
   */
  create: async (comprobanteData) => {
    try {
      // TODO: Backend debe implementar POST /api/comprobantes
      // Body: {
      //   pedido_id, cliente_nombre, cliente_cedula, cliente_direccion,
      //   cliente_telefono, metodo_pago, total
      // }
      // Response: {
      //   comprobante_id, numero_comprobante, fecha_emision, datos_completos
      // }
      const response = await post(API_ENDPOINTS.COMPROBANTES, comprobanteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Genera el PDF de un comprobante
   * @param {number} id - ID del comprobante
   * @returns {Promise<Blob>} - PDF del comprobante
   */
  generarPDF: async (id) => {
    try {
      // TODO: Backend debe implementar GET /api/comprobantes/:id/pdf
      // Response: Archivo PDF en formato blob
      const response = await get(`${API_ENDPOINTS.COMPROBANTES}/${id}/pdf`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene comprobantes del día actual
   * @returns {Promise<Array>} - Lista de comprobantes de hoy
   */
  getHoy: async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const response = await get(`${API_ENDPOINTS.COMPROBANTES}?fecha=${hoy}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Busca comprobantes por número
   * @param {string} numero - Número de comprobante
   * @returns {Promise<Array>} - Comprobantes que coinciden
   */
  buscarPorNumero: async (numero) => {
    try {
      const response = await get(`${API_ENDPOINTS.COMPROBANTES}?numero=${numero}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene estadísticas de comprobantes
   * @param {object} filters - Filtros de fecha
   * @returns {Promise<object>} - Estadísticas
   */
  getEstadisticas: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

      const query = params.toString() ? `?${params.toString()}` : '';

      // TODO: Backend debe implementar GET /api/comprobantes/estadisticas
      // Response: {
      //   total_comprobantes: number,
      //   total_ventas: number,
      //   promedio_venta: number,
      //   por_metodo_pago: { efectivo: number, tarjeta: number }
      // }
      const response = await get(`${API_ENDPOINTS.COMPROBANTES}/estadisticas${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default comprobantesService;