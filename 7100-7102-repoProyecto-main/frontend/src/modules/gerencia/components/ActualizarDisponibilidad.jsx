import React, { useEffect, useState } from 'react';
import { FaSave, FaSync } from 'react-icons/fa';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Button, Input, Alert, Spinner } from '../../../components/common';
import productosService from '../../../services/productosService';
import toast from 'react-hot-toast';

const ActualizarDisponibilidad = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cambios, setCambios] = useState({});

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const data = await productosService.getAll();
      setProductos(data);

      const inicial = {};
      data.forEach(p => {
        inicial[p.id] = p.stock_diario || 0;
      });
      setCambios(inicial);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleCambioStock = (productoId, valor) => {
    const nuevoValor = parseInt(valor) || 0;
    setCambios(prev => ({ ...prev, [productoId]: nuevoValor }));
  };

  const handleGuardar = async () => {
    setSubmitting(true);
    try {
      const productosActualizados = Object.entries(cambios).map(([id, stock]) => ({
        producto_id: parseInt(id),
        stock_diario: stock,
      }));

      await productosService.updateDisponibilidad(productosActualizados);
      toast.success('Disponibilidad actualizada exitosamente');
      fetchProductos();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar disponibilidad');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Actualizar Disponibilidad Diaria">
      <Card>
        <Card.Header
          title="Configurar Stock del Día"
          actions={
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FaSync />}
              onClick={fetchProductos}
            >
              Recargar
            </Button>
          }
        />
        <Card.Body>
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="lg" text="Cargando productos..." />
            </div>
          ) : (
            <>
              <Alert variant="info" className="mb-6">
                Ingresa la cantidad disponible de cada producto para el día de hoy.
                Solo los productos con stock mayor a 0 estarán visibles para los meseros.
              </Alert>

              <div className="space-y-4">
                {productos.map(producto => (
                  <div key={producto.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                      {producto.descripcion && (
                        <p className="text-sm text-gray-500">{producto.descripcion}</p>
                      )}
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        value={cambios[producto.id] || 0}
                        onChange={(e) => handleCambioStock(producto.id, e.target.value)}
                        placeholder="Stock"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<FaSave />}
                  onClick={handleGuardar}
                  isLoading={submitting}
                >
                  Guardar Disponibilidad
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </DashboardLayout>
  );
};

export default ActualizarDisponibilidad;