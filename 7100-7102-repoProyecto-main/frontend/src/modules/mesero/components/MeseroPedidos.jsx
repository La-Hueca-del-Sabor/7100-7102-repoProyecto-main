import React, { useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Table, Badge, Button } from '../../../components/common';
import { usePedidos } from '../../../context/PedidosContext';
import { formatDate, formatTime, formatCurrency } from '../../../utils/formatters';
import { ESTADOS_PEDIDO_COLORS } from '../../../utils/constants';

const MeseroPedidos = () => {
  const { pedidos, fetchPedidos, loading } = usePedidos();

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  const columns = [
    { key: 'numero_pedido', label: 'Nº Pedido', render: (val, row) => `#${val || row.id}` },
    { key: 'created_at', label: 'Fecha', render: (val) => formatDate(val) },
    { key: 'created_at', label: 'Hora', render: (val) => formatTime(val) },
    { key: 'total', label: 'Total', render: (val) => formatCurrency(val) },
    {
      key: 'estado',
      label: 'Estado',
      render: (val) => <Badge variant={ESTADOS_PEDIDO_COLORS[val]}>{val}</Badge>
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (_, row) => (
        <Button size="sm" variant="ghost" leftIcon={<FaEye />}>
          Ver
        </Button>
      )
    },
  ];

  return (
    <DashboardLayout title="Mis Pedidos">
      <Card>
        <Card.Header title="Historial de Pedidos" />
        <Card.Body noPadding>
          <Table
            columns={columns}
            data={pedidos}
            loading={loading}
            pagination
            searchable
            emptyMessage="No hay pedidos registrados"
          />
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default MeseroPedidos;