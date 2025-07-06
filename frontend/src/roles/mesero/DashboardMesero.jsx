// ...existing imports...
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardMesero = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [pedidosEntregados, setPedidosEntregados] = useState([]);
  const [pedidosEntregadosFiltrados, setPedidosEntregadosFiltrados] = useState(
    []
  );
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
  const [showConfirmEntregadoModal, setShowConfirmEntregadoModal] =
    useState(false);
  const [pedidoParaEntregar, setPedidoParaEntregar] = useState(null);
  const [errors, setErrors] = useState({});
  const [esConsumidorFinal, setEsConsumidorFinal] = useState(false);
  const LIMITE_NOTAS = 200;
  const [showConfirmCancelarModal, setShowConfirmCancelarModal] =
    useState(false);
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina] = useState(10);
  const [filtroEstado] = useState("entregado");
  const [totalOrdenesHoy, setTotalOrdenesHoy] = useState(0);
  const [totalMontoHoy, setTotalMontoHoy] = useState(0);

  // Agregar función para manejar la cancelación
  const handleConfirmarCancelacion = (pedido) => {
    setPedidoParaCancelar(pedido);
    setShowConfirmCancelarModal(true);
  };

  // Función para ejecutar la cancelación
  const cancelarPedido = async () => {
    try {
      const response = await fetch(
        `http://localhost:3004/api/pedidos/${pedidoParaCancelar.id}/cancelar`,
        { method: "PUT" }
      );

      if (!response.ok) throw new Error("Error al cancelar pedido");

      setShowConfirmCancelarModal(false);
      setPedidoParaCancelar(null);
      await fetchPedidos();
    } catch (error) {
      console.error(error);
      setError("Error al cancelar el pedido");
    }
  };

  // Cargar platos disponibles al montar el componente y actualizar cada 10 segundos
  useEffect(() => {
    const fetchPlatos = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/inventory/platos"
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const platosFiltrados = data.filter((p) => p.stock_disponible > 0);
        setPlatosMenu(platosFiltrados);
      } catch (error) {
        console.error("Error:", error);
        setError("Error cargando el menú");
      }
    };

    // Ejecutar fetchPlatos inmediatamente
    fetchPlatos();

    // Configurar intervalo para actualización periódica
    const intervalId = setInterval(fetchPlatos, 10000); // Actualizar cada 10 segundos

    // Limpiar intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [showFormPedido]); // Agregar showFormPedido como dependencia
  // validación en tiempo real
  const handleChangeCampo = (campo, valor) => {
    let nuevosErrores = { ...errors };

    switch (campo) {
      case "mesa":
        if (!/^\d+$/.test(valor) || Number(valor) < 1 || Number(valor) > 50) {
          nuevosErrores.mesa = "Solo valores entre 1 y 50";
        } else {
          delete nuevosErrores.mesa;
        }
        setMesa(valor);
        break;

      case "nombre":
        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*$/.test(valor)) {
          setClientName(valor);
          if (valor.trim().length < 3) {
            nuevosErrores.nombre = "Solo letras, mínimo 3 caracteres";
          } else {
            delete nuevosErrores.nombre;
          }
        }
        break;

      case "cedula":
        if (/^\d{0,10}$/.test(valor)) {
          setClientCedula(valor);
          if (valor.length !== 10) {
            nuevosErrores.cedula = "Debe tener exactamente 10 dígitos";
          } else {
            delete nuevosErrores.cedula;
          }
        }
        break;

      default:
        break;
    }

    setErrors(nuevosErrores);
  };
  //calcular el tiempo transcurrido desde el pedido
  const calcularTiempoTranscurrido = (horaPedido) => {
    const ahora = new Date();
    const inicio = new Date(horaPedido);
    const diferenciaMin = Math.floor((ahora - inicio) / 60000);

    const horas = Math.floor(diferenciaMin / 60);
    const minutos = diferenciaMin % 60;

    return horas > 0 ? `${horas}h ${minutos}min` : `${minutos} min`;
  };

  // Cargar pedidos activos y entregados
  const fetchPedidos = async () => {
    try {
      const response = await fetch(
        "http://localhost:3004/api/pedidos-detalles"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Filtrar pedidos basado en el estado y tiempo de entrega
      const ahora = new Date();
      const pedidosFiltrados = data.filter((pedido) => {
        return pedido.estado !== "COBRADO" && pedido.estado !== "ENTREGADO";
      });

      const entregados = data.filter((pedido) => {
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

  // Efecto para filtrar pedidos entregados (con filtro de hoy por defecto y paginación)
  useEffect(() => {
    const filtrarPedidos = () => {
      let pedidosFiltrados = [...pedidosEntregados];

      // Filtro por cliente (solo letras y espacios)
      if (busquedaCliente) {
        pedidosFiltrados = pedidosFiltrados.filter((pedido) =>
          pedido.cliente_nombre
            .toLowerCase()
            .includes(busquedaCliente.toLowerCase())
        );
      }

      // Filtro por fecha (por defecto hoy, máximo 1 mes atrás, nunca días futuros)
      let fechaFiltro = busquedaFecha;
      const hoy = new Date();
      const haceUnMes = new Date();
      haceUnMes.setMonth(hoy.getMonth() - 1);

      // Si no hay fecha, usar hoy
      if (!busquedaFecha) {
        fechaFiltro = hoy.toISOString().split("T")[0];
      }

      if (fechaFiltro) {
        const fechaBusqueda = new Date(fechaFiltro);
        pedidosFiltrados = pedidosFiltrados.filter((pedido) => {
          const fechaPedido = new Date(pedido.hora_pedido);
          return (
            fechaPedido.toLocaleDateString() ===
            fechaBusqueda.toLocaleDateString()
          );
        });
      }

      // Ordenar por fecha descendente
      pedidosFiltrados.sort(
        (a, b) => new Date(b.hora_pedido) - new Date(a.hora_pedido)
      );

      // Guardar totales de hoy
      if (!busquedaFecha) {
        setTotalOrdenesHoy(pedidosFiltrados.length);
        setTotalMontoHoy(
          pedidosFiltrados.reduce(
            (acc, pedido) => acc + (Number(pedido.total) || 0),
            0
          )
        );
      }

      setPedidosEntregadosFiltrados(pedidosFiltrados);
      setPagina(1); // Resetear a la primera página al filtrar
    };

    filtrarPedidos();
    // eslint-disable-next-line
  }, [pedidosEntregados, busquedaCliente, busquedaFecha]);

  // Paginación
  const totalPaginas = Math.ceil(pedidosEntregadosFiltrados.length / porPagina);
  const pedidosPaginados = pedidosEntregadosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  // Ordenar por columna
  const [ordenColumna, setOrdenColumna] = useState({
    campo: "hora_pedido",
    asc: false,
  });
  const ordenarPorColumna = (campo) => {
    const asc = ordenColumna.campo === campo ? !ordenColumna.asc : true;
    setOrdenColumna({ campo, asc });
    const sorted = [...pedidosEntregadosFiltrados].sort((a, b) => {
      if (campo === "total" || campo === "mesa") {
        return asc
          ? Number(a[campo]) - Number(b[campo])
          : Number(b[campo]) - Number(a[campo]);
      }
      if (campo === "cliente_nombre") {
        return asc
          ? a[campo].localeCompare(b[campo])
          : b[campo].localeCompare(a[campo]);
      }
      if (campo === "hora_pedido") {
        return asc
          ? new Date(a[campo]) - new Date(b[campo])
          : new Date(b[campo]) - new Date(a[campo]);
      }
      return 0;
    });
    setPedidosEntregadosFiltrados(sorted);
    setPagina(1);
  };

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
      Math.min(
        Number(nuevaCantidad) || 0,
        platosMenu.find((p) => p.id === platoId)?.stock_disponible || 0
      )
    );
    setPlatosSeleccionados((prev) => {
      const existentes = prev.filter((p) => p.id !== platoId);
      return cantidad > 0
        ? [...existentes, { id: platoId, cantidad }]
        : existentes;
    });
  };

  const getCantidadPlato = (platoId) => {
    const plato = platosSeleccionados.find((p) => p.id === platoId);
    return plato ? plato.cantidad : 0;
  };
  // helper para validación de campos

  const validarCampos = () => {
    const nuevosErrores = {};
    const nombre = clientName.trim();
    const cedula = clientCedula.trim();
    const mesaNumero = Number(mesa);

    if (!esConsumidorFinal) {
      if (!mesaNumero || mesaNumero < 1) {
        nuevosErrores.mesa = "La mesa debe ser un número positivo.";
      }

      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]{3,}$/.test(nombre)) {
        nuevosErrores.nombre = "Solo letras, mínimo 3 caracteres.";
      }

      if (!/^\d{10}$/.test(cedula)) {
        nuevosErrores.cedula = "Debe tener exactamente 10 dígitos.";
      }
    }

    if (platosSeleccionados.length === 0) {
      nuevosErrores.platos = "Debe seleccionar al menos un plato.";
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  // Manejar envío del pedido
  const handleSubmitPedido = async () => {
    let nombre = clientName.trim();
    let cedula = clientCedula.trim();
    let mesaNumero = Number(mesa);

    // Valores predeterminados si es consumidor final
    if (esConsumidorFinal) {
      nombre = "Consumidor Final";
      cedula = "9999999999";
      mesaNumero = 999;
    }

    const camposValidos = validarCampos();
    if (!camposValidos) return;

    const payload = {
      mesa: mesaNumero,
      cliente_nombre: nombre,
      cedula: cedula,
      platos: platosSeleccionados,
      notas: notasPedido,
    };

    try {
      const response = await fetch("http://localhost:3004/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al crear pedido");

      // Reset
      setShowFormPedido(false);
      setShowOrdenesActivas(true);
      setShowOrdenesEntregadas(false);
      setMesa("");
      setClientName("");
      setClientCedula("");
      setPlatosSeleccionados([]);
      setExtrasSeleccionados([]);
      setNotasPedido("");
      setErrors({});
      setEsConsumidorFinal(false);
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
      if (!response.ok)
        throw new Error("Error al marcar pedido como entregado");

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
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
      },
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
  // agrupar los pedidos por mesa
  const agruparPedidosPorMesa = (pedidos) => {
    const grupos = {};

    pedidos.forEach((pedido) => {
      const mesaKey = pedido.mesa === 999 ? "CF" : pedido.mesa;
      if (!grupos[mesaKey]) {
        grupos[mesaKey] = [];
      }
      grupos[mesaKey].push(pedido);
    });

    return grupos;
  };
  return (
    <div style={styles.contenedorPrincipal}>
      <aside style={styles.sidebar}>
        <img
          src={require("../../assets/login.jpg")}
          alt="Logo de la empresa"
          style={styles.logo}
        />
        <h2 style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>
          Acciones Rápidas
        </h2>
        <button
          style={{
            ...styles.botonPrimario,
            background: showFormPedido ? "#fdbb28" : "#444",
            color: showFormPedido ? "#222222" : "#ffffff",
          }}
          onClick={handleNuevaOrden}
        >
          Nueva Orden
        </button>
        <button
          style={{
            ...styles.botonPrimario,
            background: showOrdenesActivas ? "#fdbb28" : "#444",
            color: showOrdenesActivas ? "#222222" : "#ffffff",
          }}
          onClick={handleOrdenesActivas}
        >
          Órdenes Activas
        </button>
        <button
          style={{
            ...styles.botonPrimario,
            background: showOrdenesEntregadas ? "#fdbb28" : "#444",
            color: showOrdenesEntregadas ? "#222222" : "#ffffff",
          }}
          onClick={handleOrdenesEntregadas}
        >
          Órdenes Entregadas
        </button>
        <button
          style={{
            ...styles.botonPrimario,
            background: "#dc3545",
            color: "#ffffff",
          }}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <h1
          style={{
            fontWeight: 600,
            fontSize: "2.2rem",
            marginBottom: "2rem",
            color: "#222",
          }}
        >
          Bienvenido{usuario?.nombre ? `, ${usuario.nombre}` : ""} 👋
        </h1>

        {showOrdenesActivas && (
          <section>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              Órdenes Activas
            </h2>
            <table style={styles.tabla}>
              <thead>
                <tr style={{ background: "#fdbb28", color: "#222" }}>
                  <th style={{ padding: "0.7rem" }}># Orden</th>
                  <th style={{ padding: "0.7rem" }}>Mesa</th>
                  <th style={{ padding: "0.7rem" }}>Estado</th>
                  <th style={{ padding: "0.7rem" }}>Tiempo</th>
                  <th style={{ padding: "0.7rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No hay órdenes activas
                    </td>
                  </tr>
                ) : (
                  <>
                    {Object.entries(agruparPedidosPorMesa(pedidos)).map(
                      ([mesa, pedidosMesa]) => (
                        <React.Fragment key={mesa}>
                          <tr>
                            <td
                              colSpan="4"
                              style={{
                                background: "#eee",
                                fontWeight: "bold",
                                padding: "0.6rem",
                                textAlign: "left",
                                color: "#333",
                                fontSize: "1rem",
                                borderTop: "2px solid #ccc",
                              }}
                            >
                              Mesa {mesa}
                            </td>
                          </tr>

                          {pedidos.map((pedido) => (
                            <tr key={pedido.id}>
                              <td>{pedido.id}</td>
                              <td>{pedido.mesa}</td>
                              <td>
                                <span style={styles.estadoPendiente}>
                                  {pedido.estado}
                                </span>
                              </td>
                              <td>
                                {calcularTiempoTranscurrido(pedido.hora_pedido)}
                              </td>
                              <td style={styles.botonesAccion}>
                                <button
                                  onClick={() => handleMostrarDetalles(pedido)}
                                  style={{
                                    ...styles.botonPrimario,
                                    background: "#444",
                                  }}
                                >
                                  Detalles
                                </button>
                                {pedido.estado !== "CANCELADO" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleConfirmarEntrega(pedido)
                                      }
                                      style={{
                                        ...styles.botonPrimario,
                                        background: "#28a745",
                                      }}
                                    >
                                      Entregar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleConfirmarCancelacion(pedido)
                                      }
                                      style={{
                                        ...styles.botonPrimario,
                                        background: "#dc3545",
                                      }}
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}

                        </React.Fragment>
                      )
                    )}
                  </>
                )}
              </tbody>
            </table>
          </section>
        )}

        {showOrdenesEntregadas && (
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.3rem", margin: 0 }}>
                  Órdenes Entregadas
                </h2>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "#222",
                    marginTop: "0.5rem",
                  }}
                >
                  <strong>
                    {busquedaFecha
                      ? `Mostrando ${pedidosEntregadosFiltrados.length} órdenes`
                      : `Hoy: ${totalOrdenesHoy} órdenes | Total: $${totalMontoHoy.toFixed(
                          2
                        )}`}
                  </strong>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar por cliente..."
                  value={busquedaCliente}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                      ""
                    );
                    setBusquedaCliente(value);
                  }}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "200px",
                  }}
                />
                <input
                  type="date"
                  value={busquedaFecha}
                  max={new Date().toISOString().split("T")[0]}
                  min={(() => {
                    const hoy = new Date();
                    const haceUnMes = new Date();
                    haceUnMes.setMonth(hoy.getMonth() - 1);
                    return haceUnMes.toISOString().split("T")[0];
                  })()}
                  onChange={(e) => {
                    // No permitir fechas futuras
                    const value = e.target.value;
                    const hoy = new Date().toISOString().split("T")[0];
                    if (value > hoy) return;
                    setBusquedaFecha(value);
                  }}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "150px",
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
                      cursor: "pointer",
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
                  <th
                    style={{ padding: "0.7rem", cursor: "pointer" }}
                    onClick={() => ordenarPorColumna("mesa")}
                  >
                    Mesa{" "}
                    {ordenColumna.campo === "mesa"
                      ? ordenColumna.asc
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    style={{ padding: "0.7rem", cursor: "pointer" }}
                    onClick={() => ordenarPorColumna("cliente_nombre")}
                  >
                    Cliente{" "}
                    {ordenColumna.campo === "cliente_nombre"
                      ? ordenColumna.asc
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    style={{ padding: "0.7rem", cursor: "pointer" }}
                    onClick={() => ordenarPorColumna("hora_pedido")}
                  >
                    Hora Entrega{" "}
                    {ordenColumna.campo === "hora_pedido"
                      ? ordenColumna.asc
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th
                    style={{ padding: "0.7rem", cursor: "pointer" }}
                    onClick={() => ordenarPorColumna("total")}
                  >
                    Total{" "}
                    {ordenColumna.campo === "total"
                      ? ordenColumna.asc
                        ? "▲"
                        : "▼"
                      : ""}
                  </th>
                  <th style={{ padding: "0.7rem" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      {busquedaCliente || busquedaFecha
                        ? "No se encontraron órdenes con los filtros aplicados"
                        : "No hay órdenes entregadas"}
                    </td>
                  </tr>
                ) : (
                  pedidosPaginados.map((pedido) => (
                    <tr
                      key={pedido.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        {pedido.mesa}
                      </td>
                      <td style={{ padding: "0.7rem", textAlign: "center" }}>
                        {pedido.cliente_nombre}
                      </td>
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
                              fontSize: "0.9rem",
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
            {/* Paginación */}
            {totalPaginas > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "1.5rem 0",
                }}
              >
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  style={{
                    marginRight: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    background: pagina === 1 ? "#eee" : "#fff",
                    cursor: pagina === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Anterior
                </button>
                <span style={{ alignSelf: "center", margin: "0 1rem" }}>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={pagina === totalPaginas}
                  style={{
                    marginLeft: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    background: pagina === totalPaginas ? "#eee" : "#fff",
                    cursor: pagina === totalPaginas ? "not-allowed" : "pointer",
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        )}

        {showFormPedido && (
          <section
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
              padding: "2rem",
              maxWidth: "800px",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1.5rem",
                color: "#1a1a1a",
                borderBottom: "2px solid #fdbb28",
                paddingBottom: "0.5rem",
              }}
            >
              Nuevo Pedido
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: "500" }}>
                  <input
                    type="checkbox"
                    checked={esConsumidorFinal}
                    onChange={(e) => {
                      setEsConsumidorFinal(e.target.checked);
                      if (e.target.checked) {
                        setMesa("999");
                        setClientName("Consumidor Final");
                        setClientCedula("9999999999");
                        setErrors({});
                      } else {
                        setMesa("");
                        setClientName("");
                        setClientCedula("");
                      }
                    }}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Consumidor Final
                </label>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#666",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Número de Mesa
                </label>
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
                      boxShadow: "0 0 0 2px rgba(253,187,40,0.2)",
                    },
                  }}
                  type="number"
                  placeholder="Inserte el número de mesa"
                  min="1"
                  max="50"
                  value={mesa}
                  onChange={(e) => handleChangeCampo("mesa", e.target.value)}
                />
                {errors.mesa && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.85rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    {errors.mesa}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#666",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Nombre del Cliente
                </label>
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
                      boxShadow: "0 0 0 2px rgba(253,187,40,0.2)",
                    },
                  }}
                  type="text"
                  placeholder="Nombre completo"
                  value={clientName}
                  onChange={(e) => handleChangeCampo("nombre", e.target.value)}
                />
                {errors.nombre && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.85rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    {errors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#666",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Cédula del Cliente
                </label>
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
                      boxShadow: "0 0 0 2px rgba(253,187,40,0.2)",
                    },
                  }}
                  type="text"
                  placeholder="Número de cédula"
                  value={clientCedula}
                  onChange={(e) => handleChangeCampo("cedula", e.target.value)}
                />
                {errors.cedula && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "0.85rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    {errors.cedula}
                  </p>
                )}
              </div>
            </div>
            {errors.platos && (
              <p
                style={{
                  color: "red",
                  fontSize: "0.85rem",
                  marginTop: "-1rem",
                  marginBottom: "1rem",
                }}
              >
                {errors.platos}
              </p>
            )}

            <div style={{ marginBottom: "2rem" }}>
              <h3
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                  color: "#1a1a1a",
                }}
              >
                Platos Disponibles
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1rem",
                }}
              >
                {platosMenu.map((plato) => (
                  <div
                    key={plato.id}
                    style={{
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid #eee",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: "500",
                          marginBottom: "0.3rem",
                          color: "#1a1a1a",
                        }}
                      >
                        {plato.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        <span
                          style={{
                            color: "#2196f3",
                            fontWeight: "500",
                          }}
                        >
                          ${plato.precio}
                        </span>
                        <span style={{ margin: "0 0.5rem" }}>-</span>
                        <span>Stock: {plato.stock_disponible}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleCantidadChange(
                            plato.id,
                            Math.max(0, getCantidadPlato(plato.id) - 1)
                          )
                        }
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
                          color: "#666",
                        }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={plato.stock_disponible}
                        value={getCantidadPlato(plato.id)}
                        onChange={(e) =>
                          handleCantidadChange(plato.id, e.target.value)
                        }
                        style={{
                          width: "50px",
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          textAlign: "center",
                        }}
                      />
                      <button
                        onClick={() =>
                          handleCantidadChange(
                            plato.id,
                            Math.min(
                              plato.stock_disponible,
                              getCantidadPlato(plato.id) + 1
                            )
                          )
                        }
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
                          color: "#666",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  color: "#666",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Adicionales (opcional)
              </label>
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
                    boxShadow: "0 0 0 2px rgba(253,187,40,0.2)",
                  },
                }}
                placeholder="Instrucciones especiales, preferencias, etc."
                value={notasPedido}
                onChange={(e) => {
                  const texto = e.target.value;
                  if (texto.length <= LIMITE_NOTAS) {
                    setNotasPedido(texto);
                  }
                }}
              />
              <p
                style={{
                  fontSize: "0.8rem",
                  color: notasPedido.length >= LIMITE_NOTAS ? "red" : "#666",
                  textAlign: "right",
                }}
              >
                {notasPedido.length}/{LIMITE_NOTAS} caracteres
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: "#fee",
                  color: "#d32f2f",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
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
                  transition: "all 0.2s",
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
                disabled={
                  Object.keys(errors).length > 0 ||
                  platosSeleccionados.length === 0
                }
                style={{
                  background:
                    Object.keys(errors).length > 0 ||
                    platosSeleccionados.length === 0
                      ? "#ccc"
                      : "#fdbb28",
                  color: "#222222",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.8rem 2rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor:
                    Object.keys(errors).length > 0 ||
                    platosSeleccionados.length === 0
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                onClick={handleSubmitPedido}
              >
                <span>Crear Pedido</span>
                {platosSeleccionados.length > 0 && (
                  <span
                    style={{
                      background: "#fff",
                      color: "#1a1a1a",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    {platosSeleccionados.reduce(
                      (total, plato) => total + plato.cantidad,
                      0
                    )}
                  </span>
                )}
              </button>
            </div>
          </section>
        )}

        {showLogoutModal && (
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
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
                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                  Detalles del Pedido
                </h2>
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
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Mesa:</strong> {pedidoSeleccionado.mesa}
                </p>
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Cliente:</strong> {pedidoSeleccionado.cliente_nombre}
                </p>
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Cédula:</strong> {pedidoSeleccionado.cedula}
                </p>
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Estado:</strong>
                  <span
                    style={{
                      background:
                        pedidoSeleccionado.estado === "En Progreso"
                          ? "#4caf50"
                          : "#fdbb28",
                      color: "white",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "4px",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {pedidoSeleccionado.estado}
                  </span>
                </p>
                <p style={{ margin: "0.5rem 0" }}>
                  <strong>Hora del Pedido:</strong>{" "}
                  {new Date(pedidoSeleccionado.hora_pedido).toLocaleString()}
                </p>
              </div>

              <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                Platos Ordenados
              </h3>
              <table style={styles.detallesTable}>
                <thead>
                  <tr style={{ background: "#f5f5f5" }}>
                    <th style={{ padding: "0.7rem", textAlign: "left" }}>
                      Plato
                    </th>
                    <th style={{ padding: "0.7rem", textAlign: "center" }}>
                      Cantidad
                    </th>
                    <th style={{ padding: "0.7rem", textAlign: "right" }}>
                      Precio Unit.
                    </th>
                    <th style={{ padding: "0.7rem", textAlign: "right" }}>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoSeleccionado.platos &&
                    pedidoSeleccionado.platos.map((plato, index) => (
                      <tr
                        key={index}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: "0.7rem", textAlign: "left" }}>
                          {plato.nombre}
                        </td>
                        <td style={{ padding: "0.7rem", textAlign: "center" }}>
                          {plato.cantidad}
                        </td>
                        <td style={{ padding: "0.7rem", textAlign: "right" }}>
                          ${(Number(plato.precio) || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: "0.7rem", textAlign: "right" }}>
                          $
                          {(
                            (Number(plato.precio) || 0) * plato.cantidad
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {pedidoSeleccionado.notas && (
                <div style={{ marginTop: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                    Notas
                  </h3>
                  <p
                    style={{
                      padding: "1rem",
                      background: "#f5f5f5",
                      borderRadius: "4px",
                      margin: 0,
                    }}
                  >
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
              <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
                Confirmar Entrega
              </h2>
              <p>
                ¿Estás seguro de que quieres marcar como entregado el pedido de
                la mesa {pedidoParaEntregar.mesa}?
              </p>
              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
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
                    fontSize: "0.9rem",
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
                    fontSize: "0.9rem",
                  }}
                  onClick={marcarComoEntregado}
                >
                  Confirmar Entrega
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmCancelarModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3>Confirmar Cancelación</h3>
              <p>
                ¿Está seguro que desea cancelar este pedido? Esta acción
                restaurará el stock de los productos.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "1rem",
                }}
              >
                <button
                  onClick={() => setShowConfirmCancelarModal(false)}
                  style={{ ...styles.botonPrimario, background: "#6c757d" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={cancelarPedido}
                  style={{ ...styles.botonPrimario, background: "#dc3545" }}
                >
                  Confirmar Cancelación
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
