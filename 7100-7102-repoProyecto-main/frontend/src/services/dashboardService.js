import { get } from './api/apiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio para dashboard y reportes de gerencia
 */
const dashboardService = {
  /**
   * Obtiene métricas generales del dashboard
   * @param {object} filters - Filtros opcionales
   * @param {string} filters.fecha_inicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} filters.fecha_fin - Fecha fin (YYYY-MM-DD)
   * @returns {Promise<object>} - Métricas del dashboard
   */
  getMetricas: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);

      const query = params.toString() ? `?${params.toString()}` : '';

      // TODO: Backend debe implementar GET /api/dashboard/metricas
      // Response: {
      //   total_pedidos: number,
      //   total_ventas: number,
      //   pedidos_pendientes: number,
      //   pedidos_completados: number,
      //   producto_mas_vendido: { nombre, cantidad },
      //   venta_promedio: number
      // }
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/metricas${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene ventas por día para gráficos
   * @param {number} dias - Número de días hacia atrás (default: 7)
   * @returns {Promise<Array>} - Array de ventas por día
   */
  getVentasPorDia: async (dias = 7) => {
    try {
      // TODO: Backend debe implementar GET /api/dashboard/ventas-por-dia?dias=7
      // Response: [{ fecha: "2025-01-15", total_ventas: 450.50, cantidad_pedidos: 15 }]
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/ventas-por-dia?dias=${dias}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene productos más vendidos
   * @param {number} limit - Número de productos a retornar (default: 10)
   * @returns {Promise<Array>} - Array de productos con cantidad vendida
   */
  getProductosMasVendidos: async (limit = 10) => {
    try {
      // TODO: Backend debe implementar GET /api/dashboard/productos-top?limit=10
      // Response: [{ producto_id, nombre, cantidad_vendida, total_ventas }]
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/productos-top?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene distribución de pedidos por estado
   * @returns {Promise<Array>} - Array con conteo por estado
   */
  getPedidosPorEstado: async () => {
    try {
      // TODO: Backend debe implementar GET /api/dashboard/pedidos-por-estado
      // Response: [{ estado: "pendiente", cantidad: 5 }, { estado: "completado", cantidad: 120 }]
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/pedidos-por-estado`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene horas pico de pedidos
   * @returns {Promise<Array>} - Array de pedidos por hora
   */
  getHorasPico: async () => {
    try {
      // TODO: Backend debe implementar GET /api/dashboard/horas-pico
      // Response: [{ hora: 12, cantidad_pedidos: 25 }, { hora: 13, cantidad_pedidos: 30 }]
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/horas-pico`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Genera reporte en formato JSON
   * @param {object} filters - Filtros del reporte
   * @returns {Promise<object>} - Datos del reporte
   */
  generarReporte: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
      if (filters.tipo) params.append('tipo', filters.tipo); // 'ventas', 'productos', 'general'

      const query = params.toString() ? `?${params.toString()}` : '';

      // TODO: Backend debe implementar GET /api/dashboard/reporte
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/reporte${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene resumen del día actual
   * @returns {Promise<object>} - Resumen del día
   */
  getResumenHoy: async () => {
    try {
      // TODO: Backend debe implementar GET /api/dashboard/resumen-hoy
      // Response: {
      //   pedidos_hoy: number,
      //   ventas_hoy: number,
      //   pedidos_activos: number,
      //   productos_agotados: number
      // }
      const response = await get(`${API_ENDPOINTS.DASHBOARD}/resumen-hoy`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default dashboardService;