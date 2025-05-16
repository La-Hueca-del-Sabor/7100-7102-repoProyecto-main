import React, { useContext, useState, useEffect } from 'react';
import { PedidoContext } from '../PedidoContext';
import { PedidosParaLlevarContext } from '../PedidosParaLlevarContext';

const PedidoActual = () => {
  const { 
    pedido, 
    estadoPedido, 
    pedidoEnviado,
    eliminarPlato, 
    editarPlato,
    vaciarPedido, 
    enviarPedido,
    marcarComoEntregado 
  } = useContext(PedidoContext);
  
  const { agregarPedidoParaLlevar } = useContext(PedidosParaLlevarContext);
  
  const handleEnviarPedidoParaLlevar = () => {
    agregarPedidoParaLlevar({
      id: Date.now(),
      cliente: "Nombre del cliente",
      estado: "preparado",
      items: pedido.map(item => item.nombre)
    });
    vaciarPedido();
  };
  const [editandoIndex, setEditandoIndex] = useState(-1);
  const [cantidad, setCantidad] = useState(1);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  // Efecto para mostrar mensaje cuando el pedido es entregado
  useEffect(() => {
    if (estadoPedido === 'entregado') {
      setMostrarMensaje(true);
      // Ocultar el mensaje después de 3 segundos (mismo tiempo que el reinicio)
      setTimeout(() => {
        setMostrarMensaje(false);
      }, 3000);
    }
  }, [estadoPedido]);

  const calcularTotal = () => {
    return pedido.reduce((total, item) => total + (item.precio * (item.cantidad || 1)), 0).toFixed(2);
  };

  const iniciarEdicion = (index, cantidadActual = 1) => {
    setEditandoIndex(index);
    setCantidad(cantidadActual || 1);
  };

  const guardarEdicion = () => {
    editarPlato(editandoIndex, cantidad);
    setEditandoIndex(-1);
  };

  const cancelarEdicion = () => {
    setEditandoIndex(-1);
  };

  const getEstadoLabel = () => {
    switch(estadoPedido) {
      case 'solicitado': return 'Solicitado';
      case 'preparacion': return 'En preparación';
      case 'entregado': return 'Entregado';
      default: return 'Desconocido';
    }
  };

  const getEstadoColor = () => {
    switch(estadoPedido) {
      case 'solicitado': return 'secondary';
      case 'preparacion': return 'warning';
      case 'entregado': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="card shadow">
      <div className="card-header" style={{ backgroundColor: '#FF8C00', color: 'white', borderRadius: '8px 8px 0 0' }}>
        <h5 className="mb-0" style={{ fontWeight: '600' }}>Pedido Actual</h5>
        <div className="d-flex align-items-center mt-2">
          <span className="me-2">Estado:</span>
          <span className={`badge bg-${getEstadoColor()}`} style={{ borderRadius: '6px' }}>{getEstadoLabel()}</span>
        </div>
      </div>
      <div className="card-body">
        {mostrarMensaje && (
          <div className="alert alert-success mb-3" role="alert" style={{ borderRadius: '8px' }}>
            ¡Pedido entregado correctamente! Preparando sistema para nuevo pedido...
          </div>
        )}
        
        {pedido.length === 0 ? (
          <p className="text-muted text-center">No hay platos en el pedido actual</p>
        ) : (
          <ul className="list-group mb-3">
            {pedido.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center" style={{ borderRadius: '6px', marginBottom: '8px' }}>
                {editandoIndex === index ? (
                  <div className="d-flex w-100 align-items-center">
                    <span className="me-2" style={{ fontWeight: '500' }}>{item.nombre}</span>
                    <input 
                      type="number" 
                      className="form-control form-control-sm mx-2" 
                      style={{ width: '60px', borderRadius: '6px' }} 
                      value={cantidad} 
                      onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                    <div className="ms-auto">
                      <button 
                        className="btn btn-sm btn-success me-1"
                        onClick={guardarEdicion}
                      >
                        Guardar
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary" 
                        onClick={cancelarEdicion}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <span style={{ fontWeight: '500' }}>{item.nombre}</span>
                      {item.cantidad > 1 && <span className="badge bg-secondary ms-2" style={{ borderRadius: '6px' }}>x{item.cantidad}</span>}
                      <span className="text-muted ms-2">${item.precio}</span>
                    </div>
                    <div>
                      <button 
                        className="btn btn-sm me-1" 
                        style={{ backgroundColor: '#FF8C00', color: 'white' }} 
                        onClick={() => iniciarEdicion(index, item.cantidad)}
                        disabled={pedidoEnviado}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => eliminarPlato(index)}
                        disabled={pedidoEnviado}
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ fontWeight: '600' }}>Total: ${calcularTotal()}</h5>
          <button 
            className="btn btn-sm btn-danger" 
            onClick={vaciarPedido}
            disabled={pedido.length === 0 || pedidoEnviado}
          >
            Vaciar Pedido
          </button>
        </div>

        <div className="d-grid gap-2">
          <button 
            className="btn" 
            style={{ backgroundColor: '#FF8C00', color: 'white', fontSize: '1.1rem', padding: '10px 0' }} 
            onClick={enviarPedido}
            disabled={pedido.length === 0 || pedidoEnviado}
          >
            Enviar Pedido
          </button>
          
          {estadoPedido === 'preparacion' && (
            <button 
              className="btn btn-success" 
              style={{ fontSize: '1.1rem', padding: '10px 0' }}
              onClick={marcarComoEntregado}
            >
              Marcar como Entregado
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedidoActual;
