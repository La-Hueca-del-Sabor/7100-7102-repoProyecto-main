import React from "react";

const mesas = [
  { id: 1, nombre: "Mesa 1" },
  { id: 2, nombre: "Mesa 2" },
  { id: 3, nombre: "Mesa 3" },
  { id: 4, nombre: "Mesa 4" },
  { id: 5, nombre: "Mesa 5" },
];

const SeleccionMesa = ({ mesaSeleccionada, onSelectMesa }) => {
  return (
    <div className="card shadow mb-4" style={{ borderRadius: "8px" }}>
      <div
        className="card-header"
        style={{
          backgroundColor: "#FF8C00",
          color: "white",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h5 className="mb-0" style={{ fontWeight: "600" }}>
          Seleccionar Mesa
        </h5>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          {mesas.map((mesa) => (
            <li
              key={mesa.id}
              className={`list-group-item list-group-item-action d-flex align-items-center${
                mesaSeleccionada === mesa.id ? " active" : ""
              }`}
              onClick={() => onSelectMesa(mesa.id)}
              style={{
                cursor: "pointer",
                borderRadius: "0",
                fontWeight: "500",
                transition: "background-color 0.2s ease",
              }}
            >
              <span className="me-2">🪑</span>
              {mesa.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SeleccionMesa;
