import React, { useEffect } from 'react';
import { FaClipboardList, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Badge, Button, Spinner } from '../../../components/common';
import { usePedidos } from '../../../context/PedidosContext';
import { formatTime } from '../../../utils/formatters';
import { ESTADOS } from '../../../utils/constants';
import toast from 'react-hot-toast';

const CocinaDashboard = () => {
  const { pedidosActivos, fetchPedidosActivos, actualizarEstado, loading } = usePedidos();

  useEffect(() => {
    fetchPedidosActivos();
  }, [fetchPedidosActivos]);

  const pedidosPendientes = pedidosActivos.filter(p => p.estado === ESTADOS.PEDIDO.PENDIENTE);
const pedidosEnProceso = pedidosActivos.filter(p => p.estado === ESTADOS.PEDIDO.EN_PROCESO);

  const handleIniciarPreparacion = async (pedidoId) => {
    try {
      await actualizarEstado(pedidoId, 2); // ID 2 = En Proceso
      toast.success('Pedido en preparación');
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarcarListo = async (pedidoId) => {
    try {
      await actualizarEstado(pedidoId, 3); // ID 3 = Listo
      toast.success('Pedido listo para entregar');
    } catch (error) {
      console.error(error);
    }
  };

  const PedidoCard = ({ pedido, mostrarBotonIniciar = false, mostrarBotonListo = false }) => (
    <Card className="border-l-4 border-l-primary-500">
      <Card.Body>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Pedido #{pedido.numero_pedido || pedido.id}
            </h3>
            <p className="text-sm text-gray-500">{formatTime(pedido.created_at)}</p>
          </div>
          <Badge variant={mostrarBotonIniciar ? 'warning' : 'info'} dot>
            {pedido.estado}
          </Badge>
        </div>

        {pedido.detalles && (
          <div className="space-y-2 mb-4">
            {pedido.detalles.map((detalle, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="font-medium">{detalle.cantidad}x {detalle.producto_nombre}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          {mostrarBotonIniciar && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={() => handleIniciarPreparacion(pedido.id)}
            >
              Iniciar Preparación
            </Button>
          )}
          {mostrarBotonListo && (
            <Button
              variant="success"
              size="sm"
              fullWidth
              leftIcon={<FaCheckCircle />}
              onClick={() => handleMarcarListo(pedido.id)}
            >
              Marcar como Listo
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <DashboardLayout title="Dashboard Cocina">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" text="Cargando pedidos..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pedidos Pendientes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaClipboardList className="text-warning-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-900">
                Pedidos Pendientes
                <Badge variant="warning" className="ml-2">{pedidosPendientes.length}</Badge>
              </h2>
            </div>
            <div className="space-y-4">
              {pedidosPendientes.length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-8 text-gray-500">
                    No hay pedidos pendientes
                  </Card.Body>
                </Card>
              ) : (
                pedidosPendientes.map(pedido => (
                  <PedidoCard key={pedido.id} pedido={pedido} mostrarBotonIniciar />
                ))
              )}
            </div>
          </div>

          {/* Pedidos En Proceso */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FaClipboardList className="text-info-500 text-xl" />
              <h2 className="text-lg font-semibold text-gray-900">
                En Preparación
                <Badge variant="info" className="ml-2">{pedidosEnProceso.length}</Badge>
              </h2>
            </div>
            <div className="space-y-4">
              {pedidosEnProceso.length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-8 text-gray-500">
                    No hay pedidos en preparación
                  </Card.Body>
                </Card>
              ) : (
                pedidosEnProceso.map(pedido => (
                  <PedidoCard key={pedido.id} pedido={pedido} mostrarBotonListo />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CocinaDashboard;