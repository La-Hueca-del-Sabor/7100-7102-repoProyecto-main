import React, { useEffect, useState } from 'react';
import { FaChartLine, FaShoppingCart, FaDollarSign, FaUsers } from 'react-icons/fa';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Spinner } from '../../../components/common';
import dashboardService from '../../../services/dashboardService';
import { formatCurrency } from '../../../utils/formatters';
import toast from 'react-hot-toast';

const GerenciaDashboard = () => {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        const data = await dashboardService.getMetricas();
        setMetricas(data);
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetricas();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card hoverable>
      <Card.Body>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center`}>
            <Icon className={`text-${color}-600 text-xl`} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <DashboardLayout title="Dashboard Gerencia">
        <div className="flex justify-center py-12">
          <Spinner size="xl" text="Cargando métricas..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard Gerencia">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Ventas"
            value={formatCurrency(metricas?.total_ventas || 0)}
            icon={FaDollarSign}
            color="success"
            subtitle="Este mes"
          />
          <StatCard
            title="Total Pedidos"
            value={metricas?.total_pedidos || 0}
            icon={FaShoppingCart}
            color="primary"
            subtitle="Este mes"
          />
          <StatCard
            title="Pedidos Pendientes"
            value={metricas?.pedidos_pendientes || 0}
            icon={FaChartLine}
            color="warning"
            subtitle="Actualmente"
          />
          <StatCard
            title="Venta Promedio"
            value={formatCurrency(metricas?.venta_promedio || 0)}
            icon={FaUsers}
            color="info"
            subtitle="Por pedido"
          />
        </div>

        <Card>
          <Card.Header title="Producto Más Vendido" />
          <Card.Body>
            {metricas?.producto_mas_vendido ? (
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {metricas.producto_mas_vendido.nombre}
                </p>
                <p className="text-sm text-gray-600">
                  Cantidad vendida: {metricas.producto_mas_vendido.cantidad}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No hay datos disponibles</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GerenciaDashboard;