import React, { createContext, useState } from "react";

export const PedidosParaLlevarContext = createContext();

export const PedidosParaLlevarProvider = ({ children }) => {
  const [pedidosParaLlevar, setPedidosParaLlevar] = useState([]);

  const agregarPedidoParaLlevar = (pedido) => {
    setPedidosParaLlevar((prev) => [...prev, pedido]);
  };

  const marcarComoEntregado = (id) => {
    setPedidosParaLlevar((prev) =>
      prev.map((pedido) =>
        pedido.id === id ? { ...pedido, estado: "entregado" } : pedido
      )
    );
  };

  return (
    <PedidosParaLlevarContext.Provider value={{ pedidosParaLlevar, agregarPedidoParaLlevar, marcarComoEntregado }}>
      {children}
    </PedidosParaLlevarContext.Provider>
  );
};