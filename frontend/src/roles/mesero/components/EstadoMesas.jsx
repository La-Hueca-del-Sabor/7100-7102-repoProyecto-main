import React from "react";

const mesas = [
  { id: 1, nombre: "Mesa 1" },
  { id: 2, nombre: "Mesa 2" },
  { id: 3, nombre: "Mesa 3" },
  { id: 4, nombre: "Mesa 4" },
  { id: 5, nombre: "Mesa 5" },
];

const EstadoMesas = ({ estadosMesas, onSelectMesa }) => (
  <div className="card shadow mb-4">
    <div
      className="card-header"
      style={{ backgroundColor: "#FF8C00", color: "white" }}
    >
      <h5 className="mb-0">Estado de Mesas</h5>
    </div>
    <div className="card-body p-0">
      <ul className="list-group list-group-flush">
        {mesas.map((mesa) => {
          const estadoActual = estadosMesas[mesa.id] || "Sin pedido";
          return (
            <li
              key={mesa.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              style={{ cursor: "pointer" }}
              onClick={() => onSelectMesa(mesa.id)}
            >
              <span>🪑 {mesa.nombre}</span>
              <span
                className={`badge bg-${
                  estadoActual === "entregado"
                    ? "success"
                    : estadoActual === "preparacion"
                    ? "warning"
                    : "secondary"
                }`}
              >
                {estadoActual.charAt(0).toUpperCase() + estadoActual.slice(1)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  </div>
);

export default EstadoMesas;
