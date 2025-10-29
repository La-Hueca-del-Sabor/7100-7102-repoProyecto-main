import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import pedidosService from '../services/pedidosService';
import toast from 'react-hot-toast';

/**
 * Context para gestión de estado global de pedidos
 * Permite compartir el estado de pedidos entre módulos (Mesero, Cocina, Caja)
 */
const PedidosContext = createContext();

/**
 * Hook personalizado para acceder al contexto de pedidos
 */
export const usePedidos = () => {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe usarse dentro de PedidosProvider');
  }
  return context;
};

/**
 * Provider del contexto de pedidos
 */
export const PedidosProvider = ({ children }) => {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [pedidosListos, setPedidosListos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga todos los pedidos
   */
  const fetchPedidos = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosService.getAll(filters);
      setPedidos(data);
      return data;
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError(err.message || 'Error al cargar pedidos');
      toast.error('Error al cargar pedidos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga pedidos activos (pendientes + en proceso)
   */
  const fetchPedidosActivos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosService.getActivos();
      setPedidosActivos(data);
      return data;
    } catch (err) {
      console.error('Error al cargar pedidos activos:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carga pedidos listos para entrega
   */
  const fetchPedidosListos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pedidosService.getListos();
      setPedidosListos(data);
      return data;
    } catch (err) {
      console.error('Error al cargar pedidos listos:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo pedido
   */
  const crearPedido = useCallback(async (pedidoData) => {
    setLoading(true);
    setError(null);
    try {
      const nuevoPedido = await pedidosService.create(pedidoData);

      // Actualizar estado local
      setPedidos((prev) => [nuevoPedido, ...prev]);
      setPedidosActivos((prev) => [nuevoPedido, ...prev]);

      toast.success('Pedido creado exitosamente');
      return nuevoPedido;
    } catch (err) {
      console.error('Error al crear pedido:', err);
      setError(err.message);
      toast.error('Error al crear pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza el estado de un pedido
   */
  const actualizarEstado = useCallback(async (pedidoId, nuevoEstadoId) => {
    setLoading(true);
    setError(null);
    try {
      const pedidoActualizado = await pedidosService.updateEstado(pedidoId, nuevoEstadoId);

      // Actualizar en todos los estados
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado_id: nuevoEstadoId } : p))
      );

      setPedidosActivos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado_id: nuevoEstadoId } : p))
      );

      toast.success('Estado actualizado');
      return pedidoActualizado;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError(err.message);
      toast.error('Error al actualizar estado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Marca un pedido como entregado
   */
  const marcarEntregado = useCallback(async (pedidoId) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosService.marcarEntregado(pedidoId);

      // Remover de pedidos activos y listos
      setPedidosActivos((prev) => prev.filter((p) => p.id !== pedidoId));
      setPedidosListos((prev) => prev.filter((p) => p.id !== pedidoId));

      toast.success('Pedido entregado');
    } catch (err) {
      console.error('Error al marcar como entregado:', err);
      setError(err.message);
      toast.error('Error al marcar como entregado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancela un pedido
   */
  const cancelarPedido = useCallback(async (pedidoId) => {
    setLoading(true);
    setError(null);
    try {
      await pedidosService.cancel(pedidoId);

      // Remover de todas las listas
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
      setPedidosActivos((prev) => prev.filter((p) => p.id !== pedidoId));
      setPedidosListos((prev) => prev.filter((p) => p.id !== pedidoId));

      toast.success('Pedido cancelado');
    } catch (err) {
      console.error('Error al cancelar pedido:', err);
      setError(err.message);
      toast.error('Error al cancelar pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresca los datos automáticamente cada cierto tiempo
   */
  useEffect(() => {
    // TODO: Implementar polling o WebSocket para actualizaciones en tiempo real
    // Por ahora, usar polling cada 30 segundos
    const interval = setInterval(() => {
      // Solo refrescar si no hay una operación en curso
      if (!loading) {
        fetchPedidosActivos();
        fetchPedidosListos();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [loading, fetchPedidosActivos, fetchPedidosListos]);

  const value = {
    // Estado
    pedidos,
    pedidosActivos,
    pedidosListos,
    loading,
    error,

    // Funciones
    fetchPedidos,
    fetchPedidosActivos,
    fetchPedidosListos,
    crearPedido,
    actualizarEstado,
    marcarEntregado,
    cancelarPedido,
  };

  return (
    <PedidosContext.Provider value={value}>
      {children}
    </PedidosContext.Provider>
  );
};

export default PedidosContext;