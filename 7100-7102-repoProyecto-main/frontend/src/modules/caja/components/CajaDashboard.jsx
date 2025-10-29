import React, { useEffect, useState } from 'react';
import { FaFileInvoiceDollar, FaCheckCircle } from 'react-icons/fa';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Badge, Button, Modal, Input, Select, Spinner, Alert } from '../../../components/common';
import { usePedidos } from '../../../context/PedidosContext';
import { useForm } from '../../../hooks';
import { formatCurrency, formatTime } from '../../../utils/formatters';
import { ESTADOS_PEDIDO, METODOS_PAGO } from '../../../utils/constants';
import { validateRequired, validateEmail } from '../../../utils/validators';
import comprobantesService from '../../../services/comprobantesService';
import toast from 'react-hot-toast';

const CajaDashboard = () => {
  const { pedidosListos, fetchPedidosListos, marcarEntregado, loading } = usePedidos();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  useEffect(() => {
    fetchPedidosListos();
  }, [fetchPedidosListos]);

  const validationRules = {
    cliente_nombre: [validateRequired],
    cliente_cedula: [validateRequired],
    metodo_pago: [validateRequired],
  };

  const handleGenerarComprobante = async (values) => {
    setGenerandoPDF(true);
    try {
      const comprobanteData = {
        pedido_id: pedidoSeleccionado.id,
        cliente_nombre: values.cliente_nombre,
        cliente_cedula: values.cliente_cedula,
        cliente_direccion: values.cliente_direccion || '',
        cliente_telefono: values.cliente_telefono || '',
        metodo_pago: values.metodo_pago,
        total: pedidoSeleccionado.total,
      };

      const comprobante = await comprobantesService.create(comprobanteData);
      await marcarEntregado(pedidoSeleccionado.id);

      toast.success('Comprobante generado exitosamente');
      setModalAbierto(false);
      reset();

      // TODO: Descargar PDF automáticamente
    } catch (error) {
      console.error(error);
      toast.error('Error al generar comprobante');
    } finally {
      setGenerandoPDF(false);
    }
  };

  const { values, errors, handleInputChange, handleInputBlur, handleSubmit, reset } = useForm(
    { cliente_nombre: '', cliente_cedula: '', cliente_direccion: '', cliente_telefono: '', metodo_pago: '' },
    validationRules,
    handleGenerarComprobante
  );

  const abrirModal = (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalAbierto(true);
  };

  return (
    <DashboardLayout title="Dashboard Caja">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FaFileInvoiceDollar className="text-success-500 text-xl" />
          <h2 className="text-lg font-semibold text-gray-900">
            Pedidos Listos para Cobrar
            <Badge variant="success" className="ml-2">{pedidosListos.length}</Badge>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="xl" text="Cargando pedidos..." />
          </div>
        ) : pedidosListos.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-12">
              <FaCheckCircle className="mx-auto text-5xl text-gray-300 mb-3" />
              <p className="text-gray-500">No hay pedidos listos para cobrar</p>
            </Card.Body>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pedidosListos.map(pedido => (
              <Card key={pedido.id} className="border-l-4 border-l-success-500">
                <Card.Body>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Pedido #{pedido.numero_pedido || pedido.id}
                      </h3>
                      <p className="text-sm text-gray-500">{formatTime(pedido.created_at)}</p>
                    </div>
                    <Badge variant="success" dot>Listo</Badge>
                  </div>

                  {pedido.detalles && (
                    <div className="space-y-1 mb-3">
                      {pedido.detalles.map((d, i) => (
                        <p key={i} className="text-sm text-gray-700">
                          {d.cantidad}x {d.producto_nombre}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3 mb-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-success-600">{formatCurrency(pedido.total)}</span>
                    </div>
                  </div>

                  <Button
                    variant="success"
                    fullWidth
                    leftIcon={<FaFileInvoiceDollar />}
                    onClick={() => abrirModal(pedido)}
                  >
                    Cobrar y Generar Comprobante
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de comprobante */}
      <Modal
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          reset();
        }}
        title="Generar Comprobante"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert variant="info">
            Total a cobrar: <strong>{formatCurrency(pedidoSeleccionado?.total || 0)}</strong>
          </Alert>

          <Input
            label="Nombre del Cliente"
            name="cliente_nombre"
            value={values.cliente_nombre}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.cliente_nombre}
            required
          />

          <Input
            label="Cédula/RUC"
            name="cliente_cedula"
            value={values.cliente_cedula}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.cliente_cedula}
            required
          />

          <Input
            label="Dirección (Opcional)"
            name="cliente_direccion"
            value={values.cliente_direccion}
            onChange={handleInputChange}
          />

          <Input
            label="Teléfono (Opcional)"
            name="cliente_telefono"
            value={values.cliente_telefono}
            onChange={handleInputChange}
          />

          <Select
            label="Método de Pago"
            name="metodo_pago"
            value={values.metodo_pago}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            error={errors.metodo_pago}
            options={[
              { value: METODOS_PAGO.EFECTIVO, label: 'Efectivo' },
              { value: METODOS_PAGO.TARJETA, label: 'Tarjeta' },
              { value: METODOS_PAGO.TRANSFERENCIA, label: 'Transferencia' },
            ]}
            required
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setModalAbierto(false);
                reset();
              }}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={generandoPDF}
              fullWidth
            >
              Generar Comprobante
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default CajaDashboard;