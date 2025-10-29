import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaShoppingCart, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Layout y componentes
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Card, Button, Spinner, Badge, Alert } from '../../../components/common';

// Servicios y contexto
import productosService from '../../../services/productosService';
import { usePedidos } from '../../../context/PedidosContext';
import { useAuth } from '../../../hooks';

// Utilidades
import { ROUTES } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/formatters';

/**
 * Componente para crear un nuevo pedido
 */
const NuevoPedido = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { crearPedido } = usePedidos();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [carrito, setCarrito] = useState([]);

  // Cargar productos disponibles
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await productosService.getDisponibles();
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        toast.error('Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.producto_id === producto.id);

    if (existente) {
      // Incrementar cantidad si ya está en el carrito
      if (existente.cantidad < producto.stock_diario) {
        setCarrito(carrito.map(item =>
          item.producto_id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      } else {
        toast.error('No hay más stock disponible');
      }
    } else {
      // Agregar nuevo producto
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stock_disponible: producto.stock_diario,
      }]);
    }
  };

  // Decrementar cantidad
  const decrementarCantidad = (productoId) => {
    setCarrito(carrito.map(item =>
      item.producto_id === productoId && item.cantidad > 1
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
  };

  // Incrementar cantidad
  const incrementarCantidad = (productoId) => {
    const item = carrito.find(i => i.producto_id === productoId);
    if (item && item.cantidad < item.stock_disponible) {
      setCarrito(carrito.map(i =>
        i.producto_id === productoId
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      ));
    } else {
      toast.error('No hay más stock disponible');
    }
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.producto_id !== productoId));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Enviar pedido
  const handleSubmit = async () => {
    if (carrito.length === 0) {
      toast.error('Agrega al menos un producto al pedido');
      return;
    }

    setSubmitting(true);
    try {
      // Preparar datos del pedido
      const pedidoData = {
        usuario_id: user.id, // TODO: Obtener del contexto de auth
        estado_id: 1, // Pendiente
        detalles: carrito.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
      };

      await crearPedido(pedidoData);
      toast.success('Pedido creado exitosamente');
      navigate(ROUTES.MESERO_DASHBOARD);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Nuevo Pedido">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menú de productos */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header title="Menú Disponible" />
            <Card.Body>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Spinner size="lg" text="Cargando menú..." />
                </div>
              ) : productos.length === 0 ? (
                <Alert variant="warning">
                  No hay productos disponibles en este momento
                </Alert>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {producto.nombre}
                          </h3>
                          {producto.descripcion && (
                            <p className="text-sm text-gray-500 mt-1">
                              {producto.descripcion}
                            </p>
                          )}
                        </div>
                        <Badge variant="info">
                          Stock: {producto.stock_diario}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(producto.precio)}
                        </span>
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<FaPlus />}
                          onClick={() => agregarAlCarrito(producto)}
                          disabled={producto.stock_diario === 0}
                        >
                          Agregar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Carrito */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <Card.Header
              title="Carrito"
              actions={
                <Badge variant="primary">
                  {carrito.length} items
                </Badge>
              }
            />
            <Card.Body className="max-h-96 overflow-y-auto">
              {carrito.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaShoppingCart className="mx-auto text-4xl mb-2 text-gray-400" />
                  <p>Carrito vacío</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {carrito.map((item) => (
                    <div
                      key={item.producto_id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.nombre}
                        </h4>
                        <button
                          onClick={() => eliminarDelCarrito(item.producto_id)}
                          className="text-danger-500 hover:text-danger-700"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrementarCantidad(item.producto_id)}
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => incrementarCantidad(item.producto_id)}
                            className="w-7 h-7 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-700 flex items-center justify-center"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(item.precio * item.cantidad)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>

            {carrito.length > 0 && (
              <Card.Footer>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary-600">
                      {formatCurrency(calcularTotal())}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleSubmit}
                    isLoading={submitting}
                    leftIcon={<FaShoppingCart />}
                  >
                    Crear Pedido
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => setCarrito([])}
                  >
                    Limpiar Carrito
                  </Button>
                </div>
              </Card.Footer>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NuevoPedido;