import React, { useContext } from "react";
import { PedidosParaLlevarContext } from "../PedidosParaLlevarContext";

const PedidoParaLlevar = () => {
  const { pedidosParaLlevar, marcarComoEntregado } = useContext(PedidosParaLlevarContext);

  // Filtrar solo los pedidos en estado "preparado"
  const pedidosPreparados = pedidosParaLlevar.filter((p) => p.estado === "preparado");

  return (
    <div className="card shadow mt-4">
      <div
        className="card-header"
        style={{ backgroundColor: "#FF8C00", color: "white" }}
      >
        <h5 className="mb-0">Pedidos para Llevar Listos para Entregar</h5>
      </div>
      <div className="card-body">
        {pedidosPreparados.length === 0 ? (
          <p className="text-muted text-center">
            No hay pedidos para llevar preparados.
          </p>
        ) : (
          <ul className="list-group">
            {pedidosPreparados.map((pedido) => (
              <li
                key={pedido.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{pedido.cliente}</strong>
                  <ul className="mb-0">
                    {pedido.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="btn btn-success"
                  onClick={() => marcarComoEntregado(pedido.id)}
                >
                  Marcar como Entregado
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PedidoParaLlevar;