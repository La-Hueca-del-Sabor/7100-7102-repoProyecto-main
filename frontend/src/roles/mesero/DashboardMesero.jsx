import React, { useState } from 'react';
import MenuCategoria from './components/MenuCategoria';
import ListaPlatos from './components/ListaPlatos';
import PedidoActual from './components/PedidoActual';
import { PedidoProvider } from './PedidoContext';
import SeleccionMesa from './components/SeleccionMesa';
import EstadoMesas from './components/EstadoMesas';
import PedidoParaLlevar from './components/PedidoParaLlevar';
import { PedidosParaLlevarProvider } from './PedidosParaLlevarContext';

const DashboardMesero = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [resetPedido, setResetPedido] = useState(false);
  const [estadosMesas, setEstadosMesas] = useState({
    1: 'pendiente',
    2: 'entregado',
    3: null,
    4: null,
    5: null
  });

  // Cambiar estado de mesa de pendiente a entregado
  const handleSelectMesa = (idMesa) => {
    setMesaSeleccionada(idMesa);
  };

  const handleCambiarEstadoMesa = (idMesa, nuevoEstado) => {
    setEstadosMesas(prev => ({
      ...prev,
      [idMesa]: nuevoEstado
    }));
  };

  // Resetear PedidoActual al enviar un pedido
  const handlePedidoEnviado = () => {
    setResetPedido(true);
    setTimeout(() => setResetPedido(false), 100); // Permite reiniciar el componente
  };

  return (
    <PedidoProvider>
      <PedidosParaLlevarProvider>
        <div className="container-fluid py-4">
          <h2 className="mb-4">Panel de Mesero</h2>
          <div className="row">
            <div className="col-md-3">
              <EstadoMesas
                estadosMesas={estadosMesas}
                onSelectMesa={handleSelectMesa}
                onCambiarEstado={handleCambiarEstadoMesa}
              />
              <SeleccionMesa mesaSeleccionada={mesaSeleccionada} onSelectMesa={handleSelectMesa} />
              <MenuCategoria onSelectCategoria={setCategoriaSeleccionada} />
            </div>
            <div className="col-md-5">
              <ListaPlatos categoria={categoriaSeleccionada} />
              <PedidoParaLlevar />
            </div>
            <div className="col-md-4">
              {!resetPedido && (
                <PedidoActual
                  mesaSeleccionada={mesaSeleccionada}
                  onPedidoEnviado={handlePedidoEnviado}
                />
              )}
            </div>
          </div>
        </div>
      </PedidosParaLlevarProvider>
    </PedidoProvider>
  );
};

export default DashboardMesero;
