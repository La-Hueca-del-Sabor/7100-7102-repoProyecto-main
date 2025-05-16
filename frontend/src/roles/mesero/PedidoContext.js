import React, { createContext, useState } from 'react';

export const PedidoContext = createContext();

export const PedidoProvider = ({ children }) => {
  const [pedido, setPedido] = useState([]);
  const [estadoPedido, setEstadoPedido] = useState('solicitado'); // solicitado, preparacion, entregado
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  const agregarPlato = (plato) => {
    // Verificar si el plato ya existe en el pedido
    const platoExistente = pedido.findIndex(item => item.id === plato.id);
    
    if (platoExistente !== -1) {
      // Si el plato ya existe, incrementar la cantidad
      const nuevoPedido = [...pedido];
      nuevoPedido[platoExistente].cantidad = (nuevoPedido[platoExistente].cantidad || 1) + 1;
      setPedido(nuevoPedido);
    } else {
      // Si el plato no existe, agregarlo con cantidad 1
      setPedido([...pedido, { ...plato, cantidad: 1 }]);
    }
  };

  const eliminarPlato = (index) => {
    const nuevoPedido = [...pedido];
    nuevoPedido.splice(index, 1);
    setPedido(nuevoPedido);
  };

  const editarPlato = (index, cantidad) => {
    const nuevoPedido = [...pedido];
    nuevoPedido[index].cantidad = cantidad;
    setPedido(nuevoPedido);
  };

  const vaciarPedido = () => {
    setPedido([]);
    setEstadoPedido('solicitado');
    setPedidoEnviado(false);
  };

  // Función combinada para enviar a cocina y caja simultáneamente
  const enviarPedido = () => {
    // Lógica para enviar a cocina
    setEstadoPedido('preparacion');
    setPedidoEnviado(true);
    
    // Lógica para enviar a caja y cocina
    console.log('Pedido enviado a cocina y caja:', pedido);
    
    // Aquí se implementaría la llamada a API o servicio para enviar a cocina y caja
    // Por ejemplo:
    // api.enviarPedidoACocina(pedido);
    // api.enviarPedidoACaja(pedido);
    
    // Mostrar mensaje de confirmación (opcional)
    alert('Pedido enviado correctamente a cocina y caja');
  };

  const marcarComoEntregado = () => {
    setEstadoPedido('entregado');
    
    // Después de marcar como entregado, esperamos 3 segundos y reiniciamos el pedido
    setTimeout(() => {
      setPedido([]);
      setEstadoPedido('solicitado');
      setPedidoEnviado(false);
      console.log('Pedido reiniciado para nueva orden');
    }, 3000); // 3 segundos de espera para que el mesero pueda ver la confirmación
  };

  return (
    <PedidoContext.Provider 
      value={{ 
        pedido, 
        estadoPedido,
        pedidoEnviado,
        agregarPlato, 
        eliminarPlato, 
        editarPlato,
        vaciarPedido,
        enviarPedido,
        marcarComoEntregado
      }}
    >
      {children}
    </PedidoContext.Provider>
  );
};