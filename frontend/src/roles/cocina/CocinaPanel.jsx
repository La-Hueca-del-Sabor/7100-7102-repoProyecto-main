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
    
    // Actualizar órdenes cada 30 segundos
    const intervalId = setInterval(fetchOrdenes, 30000);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalId);
  }, []);

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
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
                maxWidth: "1100px",
                margin: "0 auto",
              }}
            >
              {ordenesPendientes.map((orden) => (
                <div
                  key={orden.id}
                  style={{
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    width: "100%",
                    maxWidth: "300px",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: "1px solid #eee",
                    margin: "0 auto",
                  }}
                >
                  <div style={{ marginBottom: "0.8rem" }}>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        color: "#222",
                        marginBottom: "0.4rem",
                        borderBottom: "2px solid #fdbb28",
                        paddingBottom: "0.4rem",
                      }}
                    >
                      Pedido #{orden.id}
                    </div>
                    <div style={{ fontSize: "1rem", color: "#444", marginBottom: "0.3rem" }}>
                      Mesa: {orden.mesa || "N/A"}
                    </div>
                    <div style={{ fontSize: "1rem", color: "#444" }}>
                      Cliente: {orden.cliente_nombre || "N/A"}
                    </div>
                    {orden.notas && (
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          marginTop: "0.6rem",
                          padding: "0.6rem",
                          background: "#fff9e6",
                          borderRadius: "6px",
                          border: "1px dashed #fdbb28"
                        }}
                      >
                        <strong>Notas:</strong> {orden.notas}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: "0.8rem" }}>
                    <h4 style={{ 
                      fontSize: "1.1rem", 
                      margin: "0.4rem 0",
                      color: "#222",
                      borderBottom: "2px solid #4caf50",
                      paddingBottom: "0.4rem"
                    }}>
                      Platos:
                    </h4>
                    {orden.platos.length === 0 ? (
                      <p style={{ fontSize: "0.9rem", color: "#666" }}>
                        No hay platos.
                      </p>
                    ) : (
                      <div style={{ 
                        background: "#f8f8f8",
                        borderRadius: "6px",
                        padding: "0.8rem",
                        marginTop: "0.4rem"
                      }}>
                        {orden.platos.map((plato, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: "1rem",
                              color: "#333",
                              padding: "0.4rem",
                              borderBottom: idx !== orden.platos.length - 1 ? "1px solid #eee" : "none",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem"
                            }}
                          >
                            <span style={{
                              background: "#4caf50",
                              color: "white",
                              borderRadius: "50%",
                              width: "22px",
                              height: "22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.85rem",
                              fontWeight: "bold"
                            }}>
                              {plato.cantidad}
                            </span>
                            <span style={{ flex: 1, fontWeight: "500" }}>{plato.nombre}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      textAlign: "right",
                      borderTop: "1px solid #eee",
                      paddingTop: "0.6rem"
                    }}
                  >
                    Hora: {orden.hora_pedido
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
