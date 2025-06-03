import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardMesero = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFormPedido, setShowFormPedido] = useState(false);
  const [mesa, setMesa] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [platosSeleccionados, setPlatosSeleccionados] = useState([]);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
  const [platosMenu, setPlatosMenu] = useState([]);
  const [error, setError] = useState("");
  const [notasPedido, setNotasPedido] = useState("");

  // Cargar platos disponibles al montar el componente
  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        const response = await fetch("http://localhost:3003/api/inventory/platos");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const platosFiltrados = data.filter((p) => p.stock_disponible > 0);
        setPlatosMenu(platosFiltrados);
      } catch (error) {
        console.error("Error:", error);
        setError("Error cargando el menú");
      }
    };
    fetchPlatos();
  }, []);

  // Cargar pedidos activos
  const fetchPedidos = async () => {
    try {
      const response = await fetch("http://localhost:3004/api/pedidos");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
      setPedidos([]);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  // Manejo de logout
  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // Manejar cambios en la cantidad de platos
  const handleCantidadChange = (platoId, nuevaCantidad) => {
    const cantidad = Math.max(
      0,
      Math.min(Number(nuevaCantidad) || 0, platosMenu.find((p) => p.id === platoId)?.stock_disponible || 0)
    );
    setPlatosSeleccionados((prev) => {
      const existentes = prev.filter((p) => p.id !== platoId);
      return cantidad > 0 ? [...existentes, { id: platoId, cantidad }] : existentes;
    });
  };

  const getCantidadPlato = (platoId) => {
    const plato = platosSeleccionados.find((p) => p.id === platoId);
    return plato ? plato.cantidad : 0;
  };

  // Manejar envío del pedido
  const handleSubmitPedido = async () => {
    if (!mesa || !clientName || !clientPhone) {
      setError("Por favor, complete todos los datos del cliente y la mesa");
      return;
    }
    if (!platosSeleccionados.length) {
      setError("Por favor selecciona al menos un plato.");
      return;
    }
  
    // 🚀 ENVIAR los datos que el backend espera
    const payload = {
      mesa,
      cliente_nombre: clientName,
      cliente_telefono: clientPhone,
      platos: platosSeleccionados,
      notas: notasPedido
    };
  
    try {
      const response = await fetch("http://localhost:3004/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al crear pedido");
      }
      // Pedido creado con éxito
      setShowFormPedido(false);
      setMesa("");
      setClientName("");
      setClientPhone("");
      setPlatosSeleccionados([]);
      setExtrasSeleccionados([]);
      setNotasPedido("");
      setError("");
      fetchPedidos();
    } catch (error) {
      console.error("Error submitting pedido:", error);
      setError(`Error al enviar el pedido: ${error.message}`);
    }
  };
  
  

  const styles = {
    contenedorPrincipal: {
      display: "flex",
      minHeight: "100vh",
      background: "#fafbfc",
    },
    sidebar: {
      width: 220,
      background: "#222",
      color: "#fff",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    botonPrimario: {
      background: "#fdbb28",
      color: "#222",
      border: "none",
      borderRadius: 6,
      padding: "0.7rem 1rem",
      fontWeight: 600,
      cursor: "pointer",
    },
    tabla: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      borderRadius: 8,
      overflow: "hidden",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "#fff",
      padding: "2rem",
      borderRadius: 8,
      minWidth: 320,
      maxWidth: 500,
      boxShadow: "0 2px 16px #0002",
    },
    input: {
      width: "100%",
      padding: "0.5rem",
      margin: "0.5rem 0",
      border: "1px solid #ddd",
      borderRadius: 4,
    },
    platoItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0.5rem 0",
      borderBottom: "1px solid #eee",
    },
  };

  return (
    <div style={styles.contenedorPrincipal}>
      <aside style={styles.sidebar}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>Acciones Rápidas</h2>
        <button style={styles.botonPrimario} onClick={() => setShowFormPedido(true)}>
          Nueva Orden
        </button>
        <button style={{ ...styles.botonPrimario, background: "#444" }}>
          Ver Menú
        </button>
        <button style={{ ...styles.botonPrimario, background: "#4caf50" }} onClick={fetchPedidos}>
          Órdenes Activas
        </button>
        <button style={{ ...styles.botonPrimario, background: "#d32f2f" }} onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <h1 style={{ fontWeight: 600, fontSize: "2.2rem", marginBottom: "2rem", color: "#222" }}>
          Panel del Mesero
        </h1>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Órdenes Activas</h2>
          <table style={styles.tabla}>
            <thead>
              <tr style={{ background: "#fdbb28", color: "#222" }}>
                <th style={{ padding: "0.7rem" }}>Mesa</th>
                <th style={{ padding: "0.7rem" }}>Estado</th>
                <th style={{ padding: "0.7rem" }}>Tiempo</th>
                <th style={{ padding: "0.7rem" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>No hay órdenes activas</td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.7rem", textAlign: "center" }}>{pedido.mesa || "N/A"}</td>
                    <td style={{ padding: "0.7rem", textAlign: "center" }}>
                      <span style={{ background: "#4caf50", color: "white", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                        {pedido.estado || "En Progreso"}
                      </span>
                    </td>
                    <td style={{ padding: "0.7rem", textAlign: "center" }}>
                      {pedido.hora_pedido
                        ? `${Math.floor((Date.now() - new Date(pedido.hora_pedido).getTime()) / 60000)} min`
                        : "N/A"}
                    </td>
                    <td style={{ padding: "0.7rem", textAlign: "center" }}>
                      <button
                        style={{ background: "#fdbb28", color: "#222", border: "none", borderRadius: "4px", padding: "0.3rem 0.8rem", cursor: "pointer" }}
                      >
                        Detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {showFormPedido && (
          <section style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 16px #0001", padding: "2rem", marginTop: "2rem", maxWidth: 500 }}>
            <h3 style={{ marginBottom: "1rem" }}>Nuevo Pedido</h3>
            <input
              style={styles.input}
              type="number"
              placeholder="Número de Mesa"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Nombre del Cliente"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <input
              style={styles.input}
              type="tel"
              placeholder="Teléfono del Cliente"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />

            <h4>Platos Disponibles</h4>
            {platosMenu.length === 0 && <p>No hay platos disponibles.</p>}
            {platosMenu.map((plato) => (
              <div key={plato.id} style={styles.platoItem}>
                <span>{plato.nombre}</span>
                <span>${plato.precio} - Stock: {plato.stock_disponible}</span>
                <input
                  type="number"
                  min="0"
                  max={plato.stock_disponible}
                  value={getCantidadPlato(plato.id)}
                  onChange={(e) => handleCantidadChange(plato.id, e.target.value)}
                  style={{ width: 60 }}
                />
              </div>
            ))}

            <textarea
              style={{ ...styles.input, height: 80 }}
              placeholder="Notas para el pedido (opcional)"
              value={notasPedido}
              onChange={(e) => setNotasPedido(e.target.value)}
            />

            {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <button
                style={{ ...styles.botonPrimario, background: "#444" }}
                onClick={() => {
                  setShowFormPedido(false);
                  setError("");
                }}
              >
                Cancelar
              </button>
              <button style={styles.botonPrimario} onClick={handleSubmitPedido}>
                Crear Pedido
              </button>
            </div>
          </section>
        )}

        {showLogoutModal && (
          <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="logout-title">
            <div style={styles.modalContent}>
              <h2 id="logout-title">Confirmar cierre de sesión</h2>
              <p>¿Estás seguro de que quieres cerrar sesión?</p>
              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                <button
                  style={{ ...styles.botonPrimario, background: "#d32f2f" }}
                  onClick={confirmLogout}
                >
                  Sí, cerrar sesión
                </button>
                <button
                  style={{ ...styles.botonPrimario, background: "#444" }}
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardMesero;
