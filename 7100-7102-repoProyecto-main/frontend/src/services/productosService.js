import { get, post, put, del } from './api/apiClient';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Servicio para gestión de productos
 */
const productosService = {
  /**
   * Obtiene todos los productos
   * @param {object} filters - Filtros opcionales
   * @param {boolean} filters.disponibles - Solo productos disponibles (stock > 0)
   * @returns {Promise<Array>} - Lista de productos
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.disponibles) params.append('disponibles', 'true');

      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await get(`${API_ENDPOINTS.PRODUCTOS}${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<object>} - Datos del producto
   */
  getById: async (id) => {
    try {
      const response = await get(API_ENDPOINTS.PRODUCTO_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtiene solo productos disponibles (con stock)
   * @returns {Promise<Array>} - Lista de productos disponibles
   */
  getDisponibles: async () => {
    try {
      const response = await get(`${API_ENDPOINTS.PRODUCTOS}?disponibles=true`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crea un nuevo producto (solo admin)
   * @param {object} productoData - Datos del producto
   * @param {string} productoData.nombre - Nombre del producto
   * @param {string} productoData.descripcion - Descripción
   * @param {number} productoData.precio - Precio
   * @param {number} productoData.stock_diario - Stock disponible
   * @returns {Promise<object>} - Producto creado
   */
  create: async (productoData) => {
    try {
      // TODO: Backend debe implementar POST /api/productos
      const response = await post(API_ENDPOINTS.PRODUCTOS, productoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualiza un producto
   * @param {number} id - ID del producto
   * @param {object} productoData - Datos a actualizar
   * @returns {Promise<object>} - Producto actualizado
   */
  update: async (id, productoData) => {
    try {
      // TODO: Backend debe implementar PUT /api/productos/:id
      const response = await put(API_ENDPOINTS.PRODUCTO_BY_ID(id), productoData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualiza el stock diario de un producto
   * @param {number} id - ID del producto
   * @param {number} stock - Nuevo stock
   * @returns {Promise<object>} - Respuesta del servidor
   */
  updateStock: async (id, stock) => {
    try {
      // TODO: Backend debe implementar PUT /api/productos/:id/stock
      const response = await put(`${API_ENDPOINTS.PRODUCTO_BY_ID(id)}/stock`, {
        stock_diario: stock,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualiza la disponibilidad de múltiples productos (Gerencia)
   * @param {Array} productos - Array de { producto_id, stock_diario }
   * @returns {Promise<object>} - Respuesta del servidor
   */
  updateDisponibilidad: async (productos) => {
    try {
      // TODO: Backend debe implementar POST /api/productos/disponibilidad
      // Body: { productos: [{ producto_id, stock_diario }] }
      const response = await post(API_ENDPOINTS.DISPONIBILIDAD, { productos });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Elimina un producto (solo admin)
   * @param {number} id - ID del producto
   * @returns {Promise<object>} - Respuesta del servidor
   */
  delete: async (id) => {
    try {
      const response = await del(API_ENDPOINTS.PRODUCTO_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default productosService;