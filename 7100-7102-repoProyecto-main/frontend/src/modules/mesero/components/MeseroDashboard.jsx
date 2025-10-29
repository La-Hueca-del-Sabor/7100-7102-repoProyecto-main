import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaClipboardList, FaClock, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Button, Badge, Spinner } from '../../../components/common';
import { usePedidos } from '../../../context/PedidosContext';
import { ROUTES, ESTADOS } from '../../../utils/constants';
import { formatDate, formatTime } from '../../../utils/formatters';

/**
 * Dashboard principal del Mesero
 */
const MeseroDashboard = () => {
  const { pedidosActivos, fetchPedidosActivos, loading } = usePedidos();
  const [stats, setStats] = useState({
    pendientes: 0,
    enProceso: 0,
    listos: 0,
  });

  // Cargar pedidos al montar
  useEffect(() => {
    fetchPedidosActivos();
  }, [fetchPedidosActivos]);

  // Calcular estadísticas
  useEffect(() => {
    if (pedidosActivos) {
      const pendientes = pedidosActivos.filter(p => p.estado === ESTADOS.PEDIDO.PENDIENTE).length;
      const enProceso = pedidosActivos.filter(p => p.estado === ESTADOS.PEDIDO.EN_PROCESO).length;
      const listos = pedidosActivos.filter(p => p.estado === ESTADOS.PEDIDO.LISTO).length;

      setStats({ pendientes, enProceso, listos });
    }
  }, [pedidosActivos]);

  // Obtener badge de estado
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case ESTADOS.PEDIDO.PENDIENTE:
        return <Badge variant="warning" dot>Pendiente</Badge>;
      case ESTADOS.PEDIDO.EN_PROCESO:
        return <Badge variant="info" dot>En Proceso</Badge>;
      case ESTADOS.PEDIDO.LISTO:
        return <Badge variant="success" dot>Listo</Badge>;
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  return (
    <DashboardLayout title="Dashboard Mesero">
      <div className="space-y-6">
        {/* Botón de nuevo pedido */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Resumen de Pedidos
          </h2>
          <Link to={ROUTES.MESERO_NUEVO_PEDIDO}>
            <Button variant="primary" leftIcon={<FaPlus />}>
              Nuevo Pedido
            </Button>
          </Link>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pendientes */}
          <Card hoverable>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-warning-600">
                    {stats.pendientes}
                  </p>
                </div>
                <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                  <FaClock className="text-warning-600 text-xl" />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* En Proceso */}
          <Card hoverable>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">En Proceso</p>
                  <p className="text-3xl font-bold text-info-600">
                    {stats.enProceso}
                  </p>
                </div>
                <div className="w-12 h-12 bg-info-100 rounded-full flex items-center justify-center">
                  <FaClipboardList className="text-info-600 text-xl" />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Listos */}
          <Card hoverable>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Listos</p>
                  <p className="text-3xl font-bold text-success-600">
                    {stats.listos}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-success-600 text-xl" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Lista de pedidos activos */}
        <Card>
          <Card.Header title="Pedidos Activos" />
          <Card.Body noPadding>
            {loading ? (
              <div className="p-12 flex justify-center">
                <Spinner size="lg" text="Cargando pedidos..." />
              </div>
            ) : pedidosActivos.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FaClipboardList className="mx-auto text-4xl mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-2">No hay pedidos activos</p>
                <p className="text-sm mb-4">Crea un nuevo pedido para comenzar</p>
                <Link to={ROUTES.MESERO_NUEVO_PEDIDO}>
                  <Button variant="primary" leftIcon={<FaPlus />}>
                    Nuevo Pedido
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pedidosActivos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Pedido #{pedido.numero_pedido || pedido.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(pedido.created_at)} - {formatTime(pedido.created_at)}
                        </p>
                      </div>
                      {getEstadoBadge(pedido.estado)}
                    </div>

                    {pedido.detalles && (
                      <div className="text-sm text-gray-600">
                        <p>{pedido.detalles.length} producto(s)</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Acceso rápido */}
        <Card>
          <Card.Header title="Acceso Rápido" />
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to={ROUTES.MESERO_NUEVO_PEDIDO}>
                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                  <FaPlus className="mx-auto text-2xl text-gray-400 mb-2" />
                  <p className="font-medium text-gray-700">Crear Nuevo Pedido</p>
                </button>
              </Link>

              <Link to={ROUTES.MESERO_PEDIDOS}>
                <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all">
                  <FaClipboardList className="mx-auto text-2xl text-gray-400 mb-2" />
                  <p className="font-medium text-gray-700">Ver Todos los Pedidos</p>
                </button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MeseroDashboard;