import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
//iconografia
import { FaSyncAlt, FaSignOutAlt } from 'react-icons/fa';

const getTiempoBadge = (horaPedido) => {
  if (!horaPedido) return { badge: null, bg: "#fff" };
  const ahora = new Date();
  const pedido = new Date(horaPedido);
  const minutos = Math.floor((ahora - pedido) / 60000);

  // Badge y color de fondo suave según tiempo
  if (minutos < 5) {
    return {
      badge: (
        <span style={{
          background: "#4caf50",
          color: "white",
          borderRadius: "12px",
          padding: "2px 10px",
          fontWeight: 600,
          fontSize: "0.95rem",
          marginLeft: "0.5rem"
        }}>
          🟢 {minutos} min
        </span>
      ),
      bg: "#eafaf1" // verde muy suave
    };
  } else if (minutos < 15) {
    return {
      badge: (
        <span style={{
          background: "#fdbb28",
          color: "#222",
          borderRadius: "12px",
          padding: "2px 10px",
          fontWeight: 600,
          fontSize: "0.95rem",
          marginLeft: "0.5rem"
        }}>
          🟡 {minutos} min
        </span>
      ),
      bg: "#fff8e1" // amarillo muy suave
    };
  } else {
    return {
      badge: (
        <span style={{
          background: "#dc3545",
          color: "white",
          borderRadius: "12px",
          padding: "2px 10px",
          fontWeight: 600,
          fontSize: "0.95rem",
          marginLeft: "0.5rem"
        }}>
          🔴 {minutos} min
        </span>
      ),
      bg: "#fdeaea" // rojo muy suave
    };
  }
};

const CocinaPanel = () => {
  const navigate = useNavigate();
  const [ordenesPendientes, setOrdenesPendientes] = useState([]);
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Cargar las órdenes pendientes y sus platos asociados
  const fetchOrdenes = async () => {
    try {
      setError("");
      const response = await fetch("http://localhost:3004/api/pedidos-detalles");
      if (!response.ok) throw new Error("Error al obtener órdenes. Intenta nuevamente.");
      const data = await response.json();

      // Solo mostrar las pendientes y ordenar por hora_pedido ascendente (más antiguas primero)
      const pendientes = data
        .filter((orden) => orden.estado === "pendiente")
        .sort((a, b) => new Date(a.hora_pedido) - new Date(b.hora_pedido));
      setOrdenesPendientes(pendientes.reverse()); // Más recientes arriba
    } catch (error) {
      setOrdenesPendientes([]);
      setError(error.message || "Error al obtener órdenes. Intenta nuevamente.");
    }
  };

  useEffect(() => {
    fetchOrdenes();
    const intervalId = setInterval(fetchOrdenes, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Cerrar sesión
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
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
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onClick={fetchOrdenes}
        >
          <FaSyncAlt color="#222" size={18} />
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
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaSignOutAlt color="white" size={18} />
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Panel */}
      <main style={{ flex: 1, padding: "2.5rem 3rem", minHeight: "100vh", boxSizing: "border-box", overflowX: "auto" }}>
        <h1
          style={{
            fontWeight: 600,
            fontSize: "2.2rem",
            marginBottom: "0.5rem",
            color: "#222",
            textAlign: "center"
          }}
        >
          Panel de Cocina
        </h1>

        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem", textAlign: "center" }}>
            Órdenes Pendientes
          </h2>

          {error ? (
            <p style={{ color: "red", marginTop: "2rem", textAlign: "center" }}>
              {error}
            </p>
          ) : ordenesPendientes.length === 0 ? (
            <p style={{ color: "#666", marginTop: "2rem", textAlign: "center" }}>
              No hay órdenes pendientes en este momento.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: "2.5rem 3.5rem", // Más separación horizontal
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "0 1rem",
                boxSizing: "border-box"
              }}
            >
              {ordenesPendientes.map((orden) => {
                const tiempo = getTiempoBadge(orden.hora_pedido);
                return (
                  <div
                    key={orden.id}
                    style={{
                      background: tiempo.bg,
                      borderRadius: 20,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                      width: "100%",
                      minWidth: 0,
                      padding: "2rem 1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: "1.5px solid #e5e5e5",
                      margin: "0 0.5rem", // Separación horizontal extra
                      transition: "box-shadow 0.2s, transform 0.2s",
                      minHeight: "270px"
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
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <span>Pedido #{orden.id}</span>
                        {tiempo.badge}
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
                        fontSize: "0.95rem",
                        color: "#666",
                        textAlign: "right",
                        borderTop: "1px solid #eee",
                        paddingTop: "0.6rem",
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <span>
                        {orden.hora_pedido
                          ? new Date(orden.hora_pedido).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Hora no disponible"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>
              ¿Cerrar sesión?
            </h2>
            <p style={{ marginBottom: "2rem", color: "#555" }}>
              ¿Estás seguro que deseas cerrar sesión?
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={cancelLogout}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  background: "#ff4d4d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CocinaPanel;
