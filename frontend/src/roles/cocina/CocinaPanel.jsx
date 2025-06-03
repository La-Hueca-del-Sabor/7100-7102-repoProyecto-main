import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CocinaPanel = () => {
  const navigate = useNavigate();
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [error, setError] = useState("");

  // Cargar las órdenes pendientes y sus platos asociados
  const fetchOrdenes = async () => {
    try {
      const response = await fetch("http://localhost:3004/api/pedidos-detalles");
      if (!response.ok) throw new Error("Error al cargar las órdenes");
      const data = await response.json();

      // Solo mostrar las pendientes
      const pendientes = data.filter((orden) => orden.estado === "pendiente");
      setOrdenesPendientes(pendientes);
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  // Marcar pedido como listo
  const handleMarcarListo = async (idOrden) => {
    try {
      const response = await fetch(
        `http://localhost:3004/api/pedidos/${idOrden}/marcar-listo`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Error al marcar pedido como listo");
      await fetchOrdenes();
    } catch (error) {
      console.error(error);
      setError("Error al marcar como listo");
    }
  };

  // Eliminar pedido
  const handleEliminarPedido = async (idOrden) => {
    if (!window.confirm("¿Seguro que quieres eliminar este pedido?")) return;
    try {
      const response = await fetch(
        `http://localhost:3004/api/pedidos/${idOrden}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Error al eliminar pedido");
      await fetchOrdenes();
    } catch (error) {
      console.error(error);
      setError("Error al eliminar el pedido");
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafbfc" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "#222",
          color: "#fff",
          padding: "2rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <img
          src={require("../../assets/login.jpg")}
          alt="Logo"
          style={{ width: "180px", marginBottom: "2rem" }}
        />
        <h2 style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>Acciones</h2>
        <button
          style={{
            background: "#fdbb28",
            color: "#222",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
          onClick={fetchOrdenes}
        >
          Actualizar Órdenes
        </button>
        <button
          style={{
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Historial Completo
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "auto",
          }}
        >
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <h1
          style={{
            fontWeight: 600,
            fontSize: "2.2rem",
            marginBottom: "0.5rem",
            color: "#222",
          }}
        >
          Panel de Cocina
        </h1>

        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
            Órdenes Pendientes
          </h2>

          {ordenesPendientes.length === 0 ? (
            <p style={{ color: "#666" }}>No hay órdenes pendientes.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              {ordenesPendientes.map((orden) => (
                <div
                  key={orden.id}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    width: "250px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ marginBottom: "0.5rem" }}>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        color: "#222",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Pedido #{orden.id}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#555" }}>
                      Mesa: {orden.mesa || "N/A"}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#555" }}>
                      Cliente: {orden.cliente_nombre || "N/A"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#777",
                        marginTop: "0.5rem",
                      }}
                    >
                      {orden.notas && `Notas: ${orden.notas}`}
                    </div>
                  </div>

                  <div style={{ marginBottom: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.85rem", margin: "0.3rem 0" }}>
                      Platos:
                    </h4>
                    {orden.platos.length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "#666" }}>
                        No hay platos.
                      </p>
                    ) : (
                      orden.platos.map((plato, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: "0.8rem",
                            color: "#333",
                            marginLeft: "0.5rem",
                          }}
                        >
                          - {plato.nombre} (x{plato.cantidad})
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <button
                      onClick={() => handleMarcarListo(orden.id)}
                      style={{
                        flex: 1,
                        background: "#4caf50",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.4rem 0.5rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Marcar Listo
                    </button>
                    <button
                      onClick={() => handleEliminarPedido(orden.id)}
                      style={{
                        flex: 1,
                        background: "#d32f2f",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "0.4rem 0.5rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>

                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "#999",
                      marginTop: "0.3rem",
                      textAlign: "right",
                    }}
                  >
                    {orden.hora_pedido
                      ? new Date(orden.hora_pedido).toLocaleTimeString()
                      : "Hora no disponible"}
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <p style={{ color: "red", marginTop: "1rem" }}>Error: {error}</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default CocinaPanel;
