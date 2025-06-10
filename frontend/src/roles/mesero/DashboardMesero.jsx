import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardMesero = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [pedidosEntregadosFiltrados, setPedidosEntregadosFiltrados] = useState([]);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [busquedaFecha, setBusquedaFecha] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFormPedido, setShowFormPedido] = useState(false);
  const [showOrdenesActivas, setShowOrdenesActivas] = useState(true);
  const [showOrdenesEntregadas, setShowOrdenesEntregadas] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [mesa, setMesa] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientCedula, setClientCedula] = useState("");
  const [platosSeleccionados, setPlatosSeleccionados] = useState([]);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState([]);
  const [platosMenu, setPlatosMenu] = useState([]);
  const [error, setError] = useState("");
  const [notasPedido, setNotasPedido] = useState("");
  const [showConfirmEntregadoModal, setShowConfirmEntregadoModal] = useState(false);
  const [pedidoParaEntregar, setPedidoParaEntregar] = useState(null);

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

  // Cargar pedidos activos y entregados
  const fetchPedidos = async () => {
    try {
      const response = await fetch("http://localhost:3004/api/pedidos-detalles");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Filtrar pedidos basado en el estado y tiempo de entrega
      const ahora = new Date();
      const pedidosFiltrados = data.filter(pedido => {
        if (pedido.estado === "ENTREGADO") {
          const tiempoEntrega = new Date(pedido.hora_pedido);
          const diferenciaTiempo = (ahora - tiempoEntrega) / 1000 / 60; // diferencia en minutos
          return diferenciaTiempo <= 3;
        }
        return true;
      });

      const entregados = data.filter(pedido => {
        if (pedido.estado === "ENTREGADO") {
          const tiempoEntrega = new Date(pedido.hora_pedido);
          const diferenciaTiempo = (ahora - tiempoEntrega) / 1000 / 60; // diferencia en minutos
          return diferenciaTiempo > 3;
        }
        return false;
      });

      setPedidos(pedidosFiltrados);
      setPedidosEntregados(entregados);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
      setPedidos([]);
      setPedidosEntregados([]);
    }
  };

  // Actualizar pedidos cada 30 segundos
  useEffect(() => {
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 30000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para filtrar pedidos entregados
  useEffect(() => {
    const filtrarPedidos = () => {
      let pedidosFiltrados = [...pedidosEntregados];

      if (busquedaCliente) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido =>
          pedido.cliente_nombre.toLowerCase().includes(busquedaCliente.toLowerCase())
        );
      }

      if (busquedaFecha) {
        const fechaBusqueda = new Date(busquedaFecha);
        pedidosFiltrados = pedidosFiltrados.filter(pedido => {
          const fechaPedido = new Date(pedido.hora_pedido);
          return fechaPedido.toLocaleDateString() === fechaBusqueda.toLocaleDateString();
        });
      }

      setPedidosEntregadosFiltrados(pedidosFiltrados);
    };

    filtrarPedidos();
  }, [pedidosEntregados, busquedaCliente, busquedaFecha]);

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
    if (!mesa || !clientName || !setClientCedula) {
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
      cedula: clientCedula,
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
      setShowOrdenesActivas(true);
      setShowOrdenesEntregadas(false);
      setMesa("");
      setClientName("");
      setClientCedula("");
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

  const handleNuevaOrden = () => {
    setShowFormPedido(true);
    setShowOrdenesActivas(false);
    setShowOrdenesEntregadas(false);
  };

  const handleOrdenesActivas = () => {
    setShowFormPedido(false);
    setShowOrdenesActivas(true);
    setShowOrdenesEntregadas(false);
    fetchPedidos();
  };

  const handleOrdenesEntregadas = () => {
    setShowFormPedido(false);
    setShowOrdenesActivas(false);
    setShowOrdenesEntregadas(true);
  };

  // Función para mostrar detalles del pedido
  const handleMostrarDetalles = (pedido) => {
    setPedidoSeleccionado(pedido);
    setShowDetallesModal(true);
  };

  // Función para mostrar modal de confirmación de entrega
  const handleConfirmarEntrega = (pedido) => {
    setPedidoParaEntregar(pedido);
    setShowConfirmEntregadoModal(true);
  };

  // Función para marcar como entregado
  const marcarComoEntregado = async () => {
    try {
      const response = await fetch(
        `http://localhost:3004/api/pedidos/${pedidoParaEntregar.id}/marcar-entregado`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Error al marcar pedido como entregado");
      
      setShowConfirmEntregadoModal(false);
      setPedidoParaEntregar(null);
      await fetchPedidos();
    } catch (error) {
      console.error(error);
      setError("Error al marcar como entregado");
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
    logo: {
      width: "180px",
      height: "auto",
      marginBottom: "2rem",
    },
    botonPrimario: {
      background: "#fdbb28",
      color: "#ffffff",
      border: "none",
      borderRadius: "8px",
      padding: "0.9rem 1.2rem",
      fontSize: "0.95rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
      }
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
    detallesModal: {
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
    },
    detallesContent: {
      background: "#fff",
      padding: "2rem",
      borderRadius: 8,
      width: "90%",
      maxWidth: 600,
      maxHeight: "80vh",
      overflow: "auto",
      boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
    },
    detallesHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.5rem",
      paddingBottom: "1rem",
      borderBottom: "1px solid #eee",
    },
    detallesTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginBottom: "1.5rem",
    },
    detallesFooter: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "1.5rem",
      paddingTop: "1rem",
      borderTop: "1px solid #eee",
    },
    estadoPendiente: {
      background: "#fdbb28",
      color: "white",
      padding: "0.2rem 0.5rem",
      borderRadius: "4px",
      display: "inline-block",
    },
    estadoEntregado: {
      background: "#4caf50",
      color: "white",
      padding: "0.2rem 0.5rem",
      borderRadius: "4px",
      display: "inline-block",
    },
    botonesAccion: {
      display: "flex",
      gap: "0.5rem",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.contenedorPrincipal}>
      <aside style={styles.sidebar}>
        <img
          src={require("../../assets/login.jpg")}
          alt="Logo de la empresa"
          style={styles.logo}
        />
        <h2 style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>Acciones Rápidas</h2>
        <button 
          style={{
            ...styles.botonPrimario,
            background: showFormPedido ? "#fdbb28" : "#444",
            color: showFormPedido ? "#222222" : "#ffffff"
          }} 
          onClick={handleNuevaOrden}
        >
          Nueva Orden
        </button>
        <button 
          style={{
            ...styles.botonPrimario,
            background: showOrdenesActivas ? "#fdbb28" : "#444",
            color: showOrdenesActivas ? "#222222" : "#ffffff"
          }}
          onClick={handleOrdenesActivas}
        >
          Órdenes Activas
        </button>
        <button 
          style={{
            ...styles.botonPrimario,
            background: showOrdenesEntregadas ? "#fdbb28" : "#444",
            color: showOrdenesEntregadas ? "#222222" : "#ffffff"
          }}
          onClick={handleOrdenesEntregadas}
        >
          Órdenes Entregadas
        </button>
        <button 
          style={{ 
            ...styles.botonPrimario, 
            background: "#dc3545",
            color: "#ffffff"
          }} 
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <h1 style={{ fontWeight: 600, fontSize: "2.2rem", marginBottom: "2rem", color: "#222" }}>
          Panel del Mesero
        </h1>

        {showOrdenesActivas && (
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
                        <span style={pedido.estado === "ENTREGADO" ? styles.estadoEntregado : styles.estadoPendiente}>
                          {pedido.estado || "PENDIENTE"}
                        </span>
                      </td>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        {pedido.hora_pedido
                          ? `${Math.floor((Date.now() - new Date(pedido.hora_pedido).getTime()) / 60000)} min`
                          : "N/A"}
                      </td>
                      <td style={{ padding: "0.7rem" }}>
                        <div style={styles.botonesAccion}>
                          <button
                            onClick={() => handleMostrarDetalles(pedido)}
                            style={{ 
                              background: "#444", 
                              color: "#ffffff", 
                              border: "none", 
                              borderRadius: "4px", 
                              padding: "0.5rem 1rem", 
                              cursor: "pointer",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "0.9rem"
                            }}
                          >
                            Detalles
                          </button>
                          {pedido.estado !== "ENTREGADO" && (
                            <button
                              onClick={() => handleConfirmarEntrega(pedido)}
                              style={{ 
                                background: "#28a745", 
                                color: "#ffffff", 
                                border: "none", 
                                borderRadius: "4px", 
                                padding: "0.5rem 1rem", 
                                cursor: "pointer",
                                fontWeight: "500",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                fontSize: "0.9rem"
                              }}
                            >
                              Entregar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {showOrdenesEntregadas && (
          <section>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "2rem"
            }}>
              <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Órdenes Entregadas</h2>
              <div style={{ 
                display: "flex", 
                gap: "1rem",
                alignItems: "center" 
              }}>
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={busquedaCliente}
                  onChange={(e) => setBusquedaCliente(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "200px"
                  }}
                />
                <input
                  type="date"
                  value={busquedaFecha}
                  onChange={(e) => setBusquedaFecha(e.target.value)}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "150px"
                  }}
                />
                {(busquedaCliente || busquedaFecha) && (
                  <button
                    onClick={() => {
                      setBusquedaCliente("");
                      setBusquedaFecha("");
                    }}
                    style={{
                      background: "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.5rem 1rem",
                      cursor: "pointer"
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
            <table style={styles.tabla}>
              <thead>
                <tr style={{ background: "#fdbb28", color: "#222" }}>
                  <th style={{ padding: "0.7rem" }}>Mesa</th>
                  <th style={{ padding: "0.7rem" }}>Cliente</th>
                  <th style={{ padding: "0.7rem" }}>Hora Entrega</th>
                  <th style={{ padding: "0.7rem" }}>Total</th>
                  <th style={{ padding: "0.7rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosEntregadosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      {busquedaCliente || busquedaFecha 
                        ? "No se encontraron órdenes con los filtros aplicados" 
                        : "No hay órdenes entregadas"}
                    </td>
                  </tr>
                ) : (
                  pedidosEntregadosFiltrados.map((pedido) => (
                    <tr key={pedido.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>{pedido.mesa}</td>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>{pedido.cliente_nombre}</td>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        {new Date(pedido.hora_pedido).toLocaleString()}
                      </td>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        ${Number(pedido.total).toFixed(2)}
                      </td>
                      <td style={{ padding: "0.7rem" }}>
                        <div style={styles.botonesAccion}>
                          <button
                            onClick={() => handleMostrarDetalles(pedido)}
                            style={{ 
                              background: "#444", 
                              color: "#ffffff", 
                              border: "none", 
                              borderRadius: "4px", 
                              padding: "0.5rem 1rem", 
                              cursor: "pointer",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                              fontSize: "0.9rem"
                            }}
                          >
                            Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {showFormPedido && (
          <section style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
            padding: "2rem",
            maxWidth: "800px"
          }}>
            <h2 style={{ 
              fontSize: "1.5rem", 
              marginBottom: "1.5rem",
              color: "#1a1a1a",
              borderBottom: "2px solid #fdbb28",
              paddingBottom: "0.5rem"
            }}>Nuevo Pedido</h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              marginBottom: "2rem"
            }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#666",
                  fontSize: "0.9rem",
                  fontWeight: "500"
                }}>Número de Mesa</label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "all 0.2s",
                    outline: "none",
                    "&:focus": {
                      borderColor: "#fdbb28",
                      boxShadow: "0 0 0 2px rgba(253,187,40,0.2)"
                    }
                  }}
                  type="number"
                  placeholder="Ej: 1"
                  value={mesa}
                  onChange={(e) => setMesa(e.target.value)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#666",
                  fontSize: "0.9rem",
                  fontWeight: "500"
                }}>Nombre del Cliente</label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "all 0.2s",
                    outline: "none",
                    "&:focus": {
                      borderColor: "#fdbb28",
                      boxShadow: "0 0 0 2px rgba(253,187,40,0.2)"
                    }
                  }}
                  type="text"
                  placeholder="Nombre completo"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#666",
                  fontSize: "0.9rem",
                  fontWeight: "500"
                }}>Cédula del Cliente</label>
                <input
                  style={{
                    width: "100%",
                    padding: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    transition: "all 0.2s",
                    outline: "none",
                    "&:focus": {
                      borderColor: "#fdbb28",
                      boxShadow: "0 0 0 2px rgba(253,187,40,0.2)"
                    }
                  }}
                  type="text"
                  placeholder="Número de cédula"
                  value={clientCedula}
                  onChange={(e) => setClientCedula(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ 
                fontSize: "1.2rem", 
                marginBottom: "1rem",
                color: "#1a1a1a"
              }}>Platos Disponibles</h3>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem"
              }}>
                {platosMenu.map((plato) => (
                  <div key={plato.id} style={{
                    background: "#f8f9fa",
                    borderRadius: "8px",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #eee"
                  }}>
                    <div>
                      <div style={{ 
                        fontWeight: "500", 
                        marginBottom: "0.3rem",
                        color: "#1a1a1a"
                      }}>{plato.nombre}</div>
                      <div style={{ 
                        fontSize: "0.9rem",
                        color: "#666"
                      }}>
                        <span style={{ 
                          color: "#2196f3", 
                          fontWeight: "500" 
                        }}>${plato.precio}</span>
                        <span style={{ margin: "0 0.5rem" }}>-</span>
                        <span>Stock: {plato.stock_disponible}</span>
                      </div>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}>
                      <button
                        onClick={() => handleCantidadChange(plato.id, Math.max(0, getCantidadPlato(plato.id) - 1))}
                        style={{
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          color: "#666"
                        }}
                      >-</button>
                      <input
                        type="number"
                        min="0"
                        max={plato.stock_disponible}
                        value={getCantidadPlato(plato.id)}
                        onChange={(e) => handleCantidadChange(plato.id, e.target.value)}
                        style={{
                          width: "50px",
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          textAlign: "center"
                        }}
                      />
                      <button
                        onClick={() => handleCantidadChange(plato.id, Math.min(plato.stock_disponible, getCantidadPlato(plato.id) + 1))}
                        style={{
                          background: "#fff",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          color: "#666"
                        }}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#666",
                fontSize: "0.9rem",
                fontWeight: "500"
              }}>Notas para el pedido (opcional)</label>
              <textarea
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  minHeight: "100px",
                  resize: "vertical",
                  transition: "all 0.2s",
                  outline: "none",
                  "&:focus": {
                    borderColor: "#fdbb28",
                    boxShadow: "0 0 0 2px rgba(253,187,40,0.2)"
                  }
                }}
                placeholder="Instrucciones especiales, preferencias, etc."
                value={notasPedido}
                onChange={(e) => setNotasPedido(e.target.value)}
              />
            </div>

            {error && (
              <div style={{
                background: "#fee",
                color: "#d32f2f",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                fontSize: "0.9rem"
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem"
            }}>
              <button
                style={{
                  background: "#444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.8rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onClick={() => {
                  setShowFormPedido(false);
                  setShowOrdenesActivas(true);
                  setError("");
                }}
              >
                Cancelar
              </button>
              <button
                style={{
                  background: "#fdbb28",
                  color: "#222222",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.8rem 2rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
                onClick={handleSubmitPedido}
              >
                <span>Crear Pedido</span>
                {platosSeleccionados.length > 0 && (
                  <span style={{
                    background: "#fff",
                    color: "#1a1a1a",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}>
                    {platosSeleccionados.reduce((total, plato) => total + plato.cantidad, 0)}
                  </span>
                )}
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

        {showDetallesModal && pedidoSeleccionado && (
          <div style={styles.detallesModal}>
            <div style={styles.detallesContent}>
              <div style={styles.detallesHeader}>
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Detalles del Pedido</h2>
                <button
                  onClick={() => setShowDetallesModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    padding: "0.5rem",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{ margin: "0.5rem 0" }}><strong>Mesa:</strong> {pedidoSeleccionado.mesa}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Cliente:</strong> {pedidoSeleccionado.cliente_nombre}</p>
                <p style={{ margin: "0.5rem 0" }}><strong>Cédula:</strong> {pedidoSeleccionado.cedula}</p>
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Estado:</strong> 
                  <span style={{
                    background: pedidoSeleccionado.estado === "En Progreso" ? "#4caf50" : "#fdbb28",
                    color: "white",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    marginLeft: "0.5rem",
                  }}>
                    {pedidoSeleccionado.estado}
                  </span>
                </p>
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Hora del Pedido:</strong> {
                    new Date(pedidoSeleccionado.hora_pedido).toLocaleString()
                  }
                </p>
              </div>

              <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Platos Ordenados</h3>
              <table style={styles.detallesTable}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: "0.7rem", textAlign: "left" }}>Plato</th>
                    <th style={{ padding: "0.7rem", textAlign: "center" }}>Cantidad</th>
                    <th style={{ padding: "0.7rem", textAlign: "right" }}>Precio Unit.</th>
                    <th style={{ padding: "0.7rem", textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoSeleccionado.platos && pedidoSeleccionado.platos.map((plato, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "0.7rem", textAlign: "left" }}>{plato.nombre}</td>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>{plato.cantidad}</td>
                      <td style={{ padding: "0.7rem", textAlign: "right" }}>${(Number(plato.precio) || 0).toFixed(2)}</td>
                      <td style={{ padding: "0.7rem", textAlign: "right" }}>
                        ${((Number(plato.precio) || 0) * plato.cantidad).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pedidoSeleccionado.notas && (
                <div style={{ marginTop: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>Notas</h3>
                  <p style={{ 
                    padding: "1rem", 
                    background: "#f5f5f5", 
                    borderRadius: "4px",
                    margin: 0 
                  }}>
                    {pedidoSeleccionado.notas}
                  </p>
                </div>
              )}

              <div style={styles.detallesFooter}>
                <div>
                  <strong>Total del Pedido: </strong>
                  <span style={{ fontSize: "1.2rem", color: "#4caf50" }}>
                    ${(Number(pedidoSeleccionado.total) || 0).toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetallesModal(false)}
                  style={{
                    background: "#444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.7rem 1.2rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmEntregadoModal && pedidoParaEntregar && (
          <div style={styles.modal} role="dialog" aria-modal="true">
            <div style={styles.modalContent}>
              <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Confirmar Entrega</h2>
              <p>¿Estás seguro de que quieres marcar como entregado el pedido de la mesa {pedidoParaEntregar.mesa}?</p>
              <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  style={{
                    background: "#444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.9rem"
                  }}
                  onClick={() => setShowConfirmEntregadoModal(false)}
                >
                  Cancelar
                </button>
                <button
                  style={{
                    background: "#28a745",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.9rem"
                  }}
                  onClick={marcarComoEntregado}
                >
                  Confirmar Entrega
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