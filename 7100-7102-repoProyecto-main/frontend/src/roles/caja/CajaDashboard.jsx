import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MenuProductos from "../../components/MenuProductos";
import html2pdf from "html2pdf.js";
//icnonografia
import { FaCashRegister, FaList, FaHistory, FaSignOutAlt } from 'react-icons/fa';

// Componente del Comprobante
const ComprobanteContenido = ({ orden }) => {
  if (!orden || !orden.platos) return null;

  return (
    <div
      style={{
        padding: "32px",
        maxWidth: "700px",
        margin: "0 auto",
        background: "#fff",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "2rem",
            margin: 0,
            color: "#fdbb28",
            letterSpacing: 1,
          }}
        >
          La Hueca del Sabor
        </h1>
        <h2
          style={{
            fontSize: "1.2rem",
            color: "#666",
            margin: "8px 0 0 0",
          }}
        >
          Comprobante de Pago
        </h2>
      </div>

      <div style={{ marginBottom: "18px", fontSize: "1rem" }}>
        <p>
          <strong>Mesa:</strong> {orden.mesa || "N/A"}
        </p>
        <p>
          <strong>Cliente:</strong> {orden.cliente_nombre || "Cliente General"}
        </p>
        <p>
          <strong>Fecha:</strong> {new Date().toLocaleString()}
        </p>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          fontSize: "1rem",
        }}
      >
        <thead>
          <tr style={{ background: "#f8f9fa" }}>
            <th
              style={{
                padding: "10px",
                border: "1px solid #dee2e6",
                textAlign: "left",
              }}
            >
              Producto
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #dee2e6",
                textAlign: "center",
              }}
            >
              Cantidad
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #dee2e6",
                textAlign: "right",
              }}
            >
              Precio Unitario
            </th>
            <th
              style={{
                padding: "10px",
                border: "1px solid #dee2e6",
                textAlign: "right",
              }}
            >
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {orden.platos.map((plato, idx) => (
            <tr key={idx}>
              <td style={{ padding: "10px", border: "1px solid #dee2e6" }}>
                {plato.nombre}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #dee2e6",
                  textAlign: "center",
                }}
              >
                {plato.cantidad}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #dee2e6",
                  textAlign: "right",
                }}
              >
                ${Number(plato.precio).toFixed(2)}
              </td>
              <td
                style={{
                  padding: "10px",
                  border: "1px solid #dee2e6",
                  textAlign: "right",
                }}
              >
                ${(plato.cantidad * Number(plato.precio)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          textAlign: "right",
          borderTop: "2px solid #fdbb28",
          paddingTop: "16px",
          fontSize: "1.2rem",
        }}
      >
        <strong>Total cobrado:&nbsp;</strong>
        <span style={{ color: "#28a745", fontWeight: "bold" }}>
          ${Number(orden.total).toFixed(2)}
        </span>
      </div>

      {orden.notas && (
        <div
          style={{
            marginTop: "18px",
            background: "#f8f9fa",
            borderRadius: "4px",
            padding: "10px",
            fontSize: "0.98rem",
          }}
        >
          <strong>Notas:</strong> {orden.notas}
        </div>
      )}

      <div
        style={{
          marginTop: "32px",
          textAlign: "center",
          color: "#888",
          fontSize: "0.95rem",
        }}
      >
        ¡Gracias por su compra!
      </div>
    </div>
  );
};

const CajaDashboard = () => {
  const navigate = useNavigate();
  const rol = "caja";
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [mostrarOrdenes, setMostrarOrdenes] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImprimirModal, setShowImprimirModal] = useState(false);
  const [ordenParaCobrar, setOrdenParaCobrar] = useState(null);
  const [ordenCobrada, setOrdenCobrada] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const componentRef = useRef();
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [ordenDesc, setOrdenDesc] = useState(false); // false: ascendente (orden de llegada)
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [filtroTransCliente, setFiltroTransCliente] = useState("");
  const [filtroTransMesa, setFiltroTransMesa] = useState("");
  const [filtroTransDesde, setFiltroTransDesde] = useState("");
  const [filtroTransHasta, setFiltroTransHasta] = useState("");
  const [filtroTransMontoMin, setFiltroTransMontoMin] = useState("");
  const [filtroTransMontoMax, setFiltroTransMontoMax] = useState("");
  const [filtroTransId, setFiltroTransId] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
//Componentes Metodos de Pago
const [metodoPago, setMetodoPago] = useState("");
const [metodosPago, setMetodosPago] = useState([]);
const [errorMetodoPago, setErrorMetodoPago] = useState(false);

  // Paginación para transacciones
  const [paginaTrans, setPaginaTrans] = useState(1);
  const [porPaginaTrans, setPorPaginaTrans] = useState(10);

  const totalPaginasTrans = Math.ceil(transacciones.length / porPaginaTrans);

  const transaccionesFiltradas = transacciones.filter((t) => {
    const coincideCliente =
      !filtroTransCliente ||
      t.cliente_nombre.toLowerCase().includes(filtroTransCliente.toLowerCase());
    const coincideMesa =
      !filtroTransMesa || t.mesa?.toString() === filtroTransMesa;
    const coincideDesde =
      !filtroTransDesde ||
      new Date(t.hora_pedido) >= new Date(filtroTransDesde + "T00:00:00");
    const coincideHasta =
      !filtroTransHasta ||
      new Date(t.hora_pedido) <= new Date(filtroTransHasta + "T23:59:59");
    const coincideMontoMin =
      !filtroTransMontoMin || Number(t.total) >= Number(filtroTransMontoMin);
    const coincideMontoMax =
      !filtroTransMontoMax || Number(t.total) <= Number(filtroTransMontoMax);
    const coincideId = !filtroTransId || t.id.toString() === filtroTransId;
    return (
      coincideCliente &&
      coincideMesa &&
      coincideDesde &&
      coincideHasta &&
      coincideMontoMin &&
      coincideMontoMax &&
      coincideId
    );
  });
  const transaccionesPaginadas = transaccionesFiltradas.slice(
    (paginaTrans - 1) * porPaginaTrans,
    paginaTrans * porPaginaTrans
  );

  const handleGenerarPDF = async () => {
    if (!ordenCobrada || !ordenCobrada.platos) {
      console.error("No hay datos válidos para generar PDF");
      return;
    }

    const element = componentRef.current;
    const opt = {
      margin: 1,
      filename: `comprobante-${ordenCobrada.id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      const pdf = await html2pdf().set(opt).from(element).save();
      setShowPdfPreview(false);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  // Función para obtener las órdenes entregadas y cobradas recientes
  const fetchOrdenes = async () => {
    setLoadingOrdenes(true);
    try {
      const response = await fetch(
        "http://localhost:3004/api/pedidos-detalles"
      );
      if (!response.ok) throw new Error("Error al obtener las órdenes");
      const data = await response.json();

      const ahora = new Date();
      const ordenesFiltradas = data.filter((orden) => {
        if (orden.estado === "ENTREGADO") return true;

        if (orden.estado === "COBRADO") {
          const horaCobro = new Date(orden.hora_pedido); // Asumiendo que se actualiza hora_pedido al cobrar
          const minutosTranscurridos = (ahora - horaCobro) / 1000 / 60;
          return minutosTranscurridos <= 4;
        }
        return false;
      });

      const transaccionesFiltradas = data.filter((orden) => {
        if (orden.estado === "COBRADO") {
          const horaCobro = new Date(orden.hora_pedido);
          const minutosTranscurridos = (ahora - horaCobro) / 1000 / 60;
          return minutosTranscurridos > 4;
        }
        return false;
      });

      setOrdenes(ordenesFiltradas);
      setTransacciones(transaccionesFiltradas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          "http://localhost:3003/api/inventory/platos"
        );
        if (!response.ok) throw new Error("Error al obtener el menú");
        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    fetchOrdenes();
    //Metodo de pago

    fetch("http://localhost:3004/api/metodos-pago")
      .then((res) => res.json())
      .then((data) => setMetodosPago(data))
      .catch((err) => console.error("Error al cargar métodos de pago:", err));

    // Actualizar las órdenes cada 30 segundos
    const interval = setInterval(fetchOrdenes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPagina(1);
  }, [estadoFiltro, busqueda, fechaInicio, fechaFin]);

  // Paginación para transacciones
  useEffect(() => {
    setPaginaTrans(1);
  }, [transacciones, porPaginaTrans]);

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

  const handleCobrarOrden = async (idOrden) => {
    if (!metodoPago) {
      setErrorMetodoPago(true);
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:3004/api/pedidos/${idOrden}/cobrar`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ metodo_pago_id: metodoPago }) // 
        }
      );
  
      if (!response.ok) throw new Error("Error al procesar el pago");
  
      setShowConfirmModal(false);
      setOrdenCobrada(ordenParaCobrar);
      setOrdenParaCobrar(null);
      setShowImprimirModal(true);
      fetchOrdenes();
    } catch (error) {
      console.error("Error en el cobro:", error);
    }
  };
  

  const handleConfirmarCobro = (orden) => {
    setOrdenParaCobrar(orden);
    setShowConfirmModal(true);
  };

  const handleImprimir = (ordenId) => {
    console.log("Imprimiendo orden:", ordenId);
    const ordenAImprimir = [...ordenes, ...transacciones].find(
      (orden) => orden.id === ordenId
    );
    if (ordenAImprimir) {
      console.log("Orden encontrada:", ordenAImprimir);
      setOrdenCobrada(ordenAImprimir);
      setShowPdfPreview(true);
    } else {
      console.error("No se encontró la orden con ID:", ordenId);
    }
  };

  const handleCerrarModalImprimir = () => {
    setShowImprimirModal(false);
    setOrdenCobrada(null);
  };

  const handleMostrarMenu = () => {
    setMostrarMenu(true);
    setMostrarTransacciones(false);
    setMostrarOrdenes(false);
  };

  const handleMostrarTransacciones = () => {
    setMostrarTransacciones(true);
    setMostrarMenu(false);
    setMostrarOrdenes(false);
  };

  const handleMostrarOrdenes = () => {
    setMostrarOrdenes(true);
    setMostrarMenu(false);
    setMostrarTransacciones(false);
  };

  // Ejemplo: Supón que 'ordenes' es el array de pedidos a mostrar
  // Calcula el total de páginas

  // Ordena las órdenes filtradas por fecha/hora de entrega antes de paginar
  // Filtrado y ordenamiento combinado
  const ordenesFiltradas = ordenes.filter((o) => {
    const coincideBusqueda =
      o.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.mesa?.toString().includes(busqueda);

    const coincideEstado =
      estadoFiltro === "TODOS" || o.estado === estadoFiltro;

    const fechaPedido = new Date(o.hora_pedido);
    const desde = fechaInicio ? new Date(fechaInicio + "T00:00:00") : null;
    const hasta = fechaFin ? new Date(fechaFin + "T23:59:59") : null;

    const coincideFecha =
      (!desde || fechaPedido >= desde) && (!hasta || fechaPedido <= hasta);

    return coincideBusqueda && coincideEstado && coincideFecha;
  });

  const ordenesOrdenadas = [...ordenesFiltradas].sort((a, b) => {
    const fechaA = new Date(a.hora_pedido);
    const fechaB = new Date(b.hora_pedido);
    return ordenDesc ? fechaB - fechaA : fechaA - fechaB;
  });

  const totalPaginas = Math.ceil(ordenesOrdenadas.length / porPagina);

  const ordenesPaginadas = ordenesOrdenadas.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const productosFiltrados = productos.filter((p) => {
    const coincideNombre = p.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const coincideStock =
      !soloStockBajo ||
      (p.stock_disponible !== undefined && p.stock_disponible <= 5);
    return coincideNombre && coincideStock;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafbfc" }}>
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
          alt="Logo de la empresa"
          style={{
            width: "180px",
            height: "auto",
            marginBottom: "2rem",
          }}
        />
        <h2 style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>Acciones</h2>
        <button
          onClick={handleMostrarOrdenes}
          style={{
            background: mostrarOrdenes ? "#fdbb28" : "#444",
            color: mostrarOrdenes ? "#222" : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaCashRegister color={mostrarOrdenes ? "#222" : "#fff"} size={18} />
          Órdenes por Cobrar
        </button>
        <button
          onClick={handleMostrarMenu}
          style={{
            background: mostrarMenu ? "#fdbb28" : "#444",
            color: mostrarMenu ? "#222" : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaList color={mostrarMenu ? "#222" : "#fff"} size={18} />
          Menú
        </button>
        <button
          onClick={handleMostrarTransacciones}
          style={{
            background: mostrarTransacciones ? "#fdbb28" : "#444",
            color: mostrarTransacciones ? "#222" : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <FaHistory color={mostrarTransacciones ? "#222" : "#fff"} size={18} />
          Ver Transacciones
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

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <div>
          <h1
            style={{
              fontWeight: 600,
              fontSize: "2.2rem",
              marginBottom: "0.5rem",
              color: "#222",
            }}
          >
            Panel de Caja
          </h1>
          <p
            style={{
              color: "#555",
              fontSize: "1.1rem",
              marginBottom: "2rem",
              maxWidth: 400,
              textAlign: "center",
            }}
          >
            Gestiona cobros, revisa transacciones y controla el flujo de caja
          </p>
        </div>

        {mostrarOrdenes && (
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Órdenes por Cobrar</h2>
            {loadingOrdenes ? (
              <div style={{ textAlign: "center", margin: "2rem" }}>
                <div
                  className="spinner"
                  style={{
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #fdbb28",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 1rem",
                  }}
                />
                <p>Cargando órdenes...</p>
              </div>
            ) : error ? (
              <p style={{ color: "red" }}>Error: {error}</p>
            ) : ordenes.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "2rem",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                No hay órdenes pendientes de cobro
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  {/* Filtro por estado */}
                  <label>
                    Estado:&nbsp;
                    <select
                      value={estadoFiltro}
                      onChange={(e) => setEstadoFiltro(e.target.value)}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    >
                      <option value="TODOS">Todos</option>
                      <option value="ENTREGADO">Entregado</option>
                      <option value="COBRADO">Cobrado</option>
                      <option value="CANCELADO">Cancelado</option>
                      <option value="PENDIENTE">Pendiente</option>
                    </select>
                  </label>
                  {/* Filtro por fecha inicial */}
                  <label>
                    Desde:&nbsp;
                    <input
                      type="date"
                      value={fechaInicio}
                      max={new Date().toISOString().split("T")[0]}
                      min={(() => {
                        const hoy = new Date();
                        const haceUnMes = new Date();
                        haceUnMes.setMonth(hoy.getMonth() - 1);
                        return haceUnMes.toISOString().split("T")[0];
                      })()}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  </label>
                  {/* Filtro por fecha final */}
                  <label>
                    Hasta:&nbsp;
                    <input
                      type="date"
                      value={fechaFin}
                      max={new Date().toISOString().split("T")[0]}
                      min={
                        fechaInicio ||
                        (() => {
                          const hoy = new Date();
                          const haceUnMes = new Date();
                          haceUnMes.setMonth(hoy.getMonth() - 1);
                          return haceUnMes.toISOString().split("T")[0];
                        })()
                      }
                      onChange={(e) => setFechaFin(e.target.value)}
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  </label>
                  {/* Filtro por cliente */}
                  <input
                    type="text"
                    placeholder="Buscar por cliente..."
                    value={busqueda}
                    onChange={(e) =>
                      setBusqueda(
                        e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
                      )
                    }
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      width: "180px",
                    }}
                  />
                  {(busqueda ||
                    fechaInicio ||
                    fechaFin ||
                    estadoFiltro !== "TODOS") && (
                    <button
                      onClick={() => {
                        setBusqueda("");
                        setFechaInicio("");
                        setFechaFin("");
                        setEstadoFiltro("TODOS");
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

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #eee" }}>
                      <th
                        style={{ padding: "12px", cursor: "pointer" }}
                        onClick={() => setOrdenDesc((prev) => !prev)}
                      >
                        Fecha/Hora {ordenDesc ? "▼" : "▲"}
                      </th>
                      <th style={{ padding: "12px" }}>Mesa</th>
                      <th style={{ padding: "12px" }}>Cliente</th>
                      <th style={{ padding: "12px" }}>Total</th>
                      <th style={{ padding: "12px" }}>Estado</th>
                      <th style={{ padding: "12px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenesPaginadas.map((orden) => (
                      <tr
                        key={orden.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: "12px" }}>
                          {new Date(orden.hora_pedido).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {orden.mesa || "N/A"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {orden.cliente_nombre}
                        </td>
                        <td style={{ padding: "12px" }}>${orden.total}</td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              background:
                                orden.estado === "COBRADO"
                                  ? "#4caf50"
                                  : orden.estado === "ENTREGADO"
                                  ? "#fdbb28"
                                  : orden.estado === "CANCELADO"
                                  ? "#dc3545"
                                  : orden.estado === "PENDIENTE"
                                  ? "#007bff"
                                  : "#888",
                              color: "white",
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              letterSpacing: "0.5px",
                              textTransform: "capitalize",
                              display: "inline-block",
                              minWidth: "90px",
                              textAlign: "center",
                            }}
                          >
                            {orden.estado.toLowerCase()}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>
                          {orden.estado === "ENTREGADO" ? (
                            <button
                              onClick={() => handleConfirmarCobro(orden)}
                              style={{
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 12px",
                                cursor: "pointer",
                              }}
                            >
                              Cobrar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleImprimir(orden.id)}
                              style={{
                                background: "#17a2b8",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 12px",
                                cursor: "pointer",
                              }}
                            >
                              Imprimir
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Controles de paginación */}
                {totalPaginas > 1 && (
                  <div
                    style={{
                      margin: "1rem 0",
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                    }}
                  >
                    <button
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                      disabled={pagina === 1}
                    >
                      Anterior
                    </button>
                    <span>
                      Página {pagina} de {totalPaginas}
                    </span>
                    <button
                      onClick={() =>
                        setPagina((p) => Math.min(totalPaginas, p + 1))
                      }
                      disabled={pagina === totalPaginas}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mostrarTransacciones && (
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Historial de Transacciones</h2>
            {loadingOrdenes ? (
              <p>Cargando transacciones...</p>
            ) : error ? (
              <p style={{ color: "red" }}>Error: {error}</p>
            ) : transacciones.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "2rem",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                No hay transacciones para mostrar
              </div>
            ) : (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  padding: "1rem",
                }}
              >
                {/* Filtros para transacciones */}
                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="ID"
                    value={filtroTransId}
                    onChange={(e) => {
                      // Solo números
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setFiltroTransId(val);
                    }}
                    style={{
                      width: 60,
                      padding: "0.3rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                    maxLength={8}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Mesa"
                    value={filtroTransMesa}
                    onChange={(e) => {
                      // Solo números
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setFiltroTransMesa(val);
                    }}
                    style={{
                      width: 60,
                      padding: "0.3rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                    maxLength={3}
                  />
                  <input
                    type="text"
                    placeholder="Cliente"
                    value={filtroTransCliente}
                    onChange={(e) => {
                      // Solo letras y espacios
                      const val = e.target.value.replace(
                        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                        ""
                      );
                      setFiltroTransCliente(val);
                    }}
                    style={{
                      width: 120,
                      padding: "0.3rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                    maxLength={30}
                  />
                  <input
                    type="date"
                    value={filtroTransDesde}
                    max={new Date().toISOString().split("T")[0]}
                    min={(() => {
                      const hoy = new Date();
                      const haceUnMes = new Date();
                      haceUnMes.setMonth(hoy.getMonth() - 1);
                      return haceUnMes.toISOString().split("T")[0];
                    })()}
                    onChange={(e) => setFiltroTransDesde(e.target.value)}
                    style={{
                      padding: "0.3rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                  />
                  <input
                    type="date"
                    value={filtroTransHasta}
                    max={new Date().toISOString().split("T")[0]}
                    min={
                      filtroTransDesde ||
                      (() => {
                        const hoy = new Date();
                        const haceUnMes = new Date();
                        haceUnMes.setMonth(hoy.getMonth() - 1);
                        return haceUnMes.toISOString().split("T")[0];
                      })()
                    }
                    onChange={(e) => setFiltroTransHasta(e.target.value)}
                    style={{
                      padding: "0.3rem 0.7rem",
                      borderRadius: 4,
                      border: "1px solid #ddd",
                    }}
                  />
                  {(filtroTransCliente ||
                    filtroTransMesa ||
                    filtroTransDesde ||
                    filtroTransHasta ||
                    filtroTransId) && (
                    <button
                      onClick={() => {
                        setFiltroTransCliente("");
                        setFiltroTransMesa("");
                        setFiltroTransDesde("");
                        setFiltroTransHasta("");
                        setFiltroTransId("");
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
                {/* Selector de cantidad por página */}
                <div
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <label>
                    Mostrar&nbsp;
                    <select
                      value={porPaginaTrans}
                      onChange={(e) =>
                        setPorPaginaTrans(Number(e.target.value))
                      }
                      style={{
                        padding: "0.3rem 0.7rem",
                        borderRadius: 4,
                        border: "1px solid #ddd",
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    &nbsp;registros por página
                  </label>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #eee" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "12px" }}>Mesa</th>
                      <th style={{ padding: "12px" }}>Cliente</th>
                      <th style={{ padding: "12px" }}>Total</th>
                      <th style={{ padding: "12px" }}>Fecha de Cobro</th>
                      <th style={{ padding: "12px" }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaccionesPaginadas.map((transaccion) => (
                      <tr
                        key={transaccion.id}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: "12px" }}>#{transaccion.id}</td>
                        <td style={{ padding: "12px" }}>
                          {transaccion.mesa || "N/A"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {transaccion.cliente_nombre}
                        </td>
                        <td style={{ padding: "12px" }}>
                          ${transaccion.total}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {new Date(transaccion.hora_pedido).toLocaleString()}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() => handleImprimir(transaccion.id)}
                            style={{
                              background: "#17a2b8",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              padding: "8px 12px",
                              cursor: "pointer",
                            }}
                          >
                            Imprimir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Controles de paginación */}
                {totalPaginasTrans > 1 && (
                  <div
                    style={{
                      margin: "1rem 0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <button
                      onClick={() => setPaginaTrans((p) => Math.max(1, p - 1))}
                      disabled={paginaTrans === 1}
                    >
                      Anterior
                    </button>
                    <span>
                      Página {paginaTrans} de {totalPaginasTrans}
                    </span>
                    <button
                      onClick={() =>
                        setPaginaTrans((p) =>
                          Math.min(totalPaginasTrans, p + 1)
                        )
                      }
                      disabled={paginaTrans === totalPaginasTrans}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mostrarMenu &&
          (loading ? (
            <p>Cargando menú...</p>
          ) : error ? (
            <p style={{ color: "red" }}>Error: {error}</p>
          ) : (
            <div style={{ marginTop: "2rem", width: "100%", maxWidth: 1000 }}>
              <h2
                style={{
                  fontWeight: 700,
                  fontSize: "2rem",
                  marginBottom: "1.5rem",
                }}
              >
                Menú de Productos
              </h2>

              {/* Filtros para el menú */}
              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={filtroNombre}
                  onChange={(e) => {
                    // Solo letras y espacios
                    const val = e.target.value.replace(
                      /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
                      ""
                    );
                    setFiltroNombre(val);
                  }}
                  style={{
                    padding: "0.5rem",
                    borderRadius: 4,
                    border: "1px solid #ddd",
                  }}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={soloStockBajo}
                    onChange={(e) => setSoloStockBajo(e.target.checked)}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Solo stock bajo
                </label>
                {(filtroNombre || soloStockBajo) && (
                  <button
                    onClick={() => {
                      setFiltroNombre("");
                      setSoloStockBajo(false);
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    style={{
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                      padding: "1.5rem 1.2rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      transition: "box-shadow 0.2s, transform 0.2s",
                      cursor: "pointer",
                      border: "1px solid #f0f0f0",
                      minHeight: "150px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(253,187,40,0.18)";
                      e.currentTarget.style.transform =
                        "translateY(-2px) scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.07)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        marginBottom: "0.5rem",
                        color: "#222",
                      }}
                    >
                      {producto.nombre}
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        color: "#28a745",
                        fontWeight: 600,
                        marginBottom: "0.3rem",
                      }}
                    >
                      Precio: ${Number(producto.precio).toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.98rem",
                        color: "#007bff",
                        marginBottom: "0.3rem",
                      }}
                    >
                      Stock disponible:{" "}
                      <span style={{ color: "#222", fontWeight: 600 }}>
                        {producto.stock_disponible ?? "N/A"}
                      </span>
                    </div>
                    {producto.descripcion && (
                      <div
                        style={{
                          fontSize: "0.95rem",
                          color: "#666",
                          marginTop: "0.5rem",
                        }}
                      >
                        {producto.descripcion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </main>

      {/* Modal de confirmación de cobro */}
      {showConfirmModal && ordenParaCobrar && (
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
              maxWidth: "600px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem" }}>
              Confirmar Cobro
            </h2>
            <div style={{ marginBottom: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <p>
                  <strong>Mesa:</strong> {ordenParaCobrar.mesa}
                </p>
                <p>
                  <strong>Cliente:</strong> {ordenParaCobrar.cliente_nombre}
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                    color: "#495057",
                  }}
                >
                  Detalle del Pedido:
                </h3>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      background: "white",
                    }}
                  >
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        background: "#f8f9fa",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      <tr>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                          }}
                        >
                          Plato
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "center",
                          }}
                        >
                          Cantidad
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "right",
                          }}
                        >
                          Precio Unit.
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "right",
                          }}
                        >
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {ordenParaCobrar.platos &&
                        ordenParaCobrar.platos.map((plato, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <td style={{ padding: "0.75rem" }}>
                              {plato.nombre}
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                textAlign: "center",
                              }}
                            >
                              {plato.cantidad}
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                textAlign: "right",
                              }}
                            >
                              ${Number(plato.precio).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: "0.75rem",
                                textAlign: "right",
                              }}
                            >
                              $
                              {(plato.cantidad * Number(plato.precio)).toFixed(
                                2
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        fontWeight: "bold",
                        display: "block",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Método de Pago
                    </label>
                    <select
                      value={metodoPago}
                      onChange={(e) => {
                        setMetodoPago(e.target.value);
                        setErrorMetodoPago(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: errorMetodoPago
                          ? "2px solid red"
                          : "1px solid #ccc",
                      }}
                    >
                      <option value="">-- Selecciona un método --</option>
                      {metodosPago.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                    {errorMetodoPago && (
                      <span style={{ color: "red", fontSize: "0.9rem" }}>
                        * Debes seleccionar un método de pago.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {ordenParaCobrar.notas && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Notas:</strong> {ordenParaCobrar.notas}
                </div>
              )}

              <div
                style={{
                  borderTop: "2px solid #dee2e6",
                  paddingTop: "1rem",
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>
                  <strong>Total a cobrar:</strong>
                </span>
                <span
                  style={{
                    fontSize: "1.5rem",
                    color: "#28a745",
                    fontWeight: "bold",
                  }}
                >
                  ${Number(ordenParaCobrar.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
                borderTop: "1px solid #dee2e6",
                paddingTop: "1.5rem",
              }}
            >
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setOrdenParaCobrar(null);
                }}
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
                onClick={() => handleCobrarOrden(ordenParaCobrar.id)}
                style={{
                  background: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de impresión */}
      {showImprimirModal && ordenCobrada && (
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
              maxWidth: "500px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "#28a745",
                color: "white",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "2rem",
              }}
            >
              ✓
            </div>
            <h2
              style={{
                marginBottom: "1rem",
                fontSize: "1.5rem",
                color: "#28a745",
              }}
            >
              ¡Cobro Exitoso!
            </h2>
            <p
              style={{
                marginBottom: "2rem",
                fontSize: "1.1rem",
                color: "#666",
              }}
            >
              El comprobante se encuentra en el historial de transacciones.{" "}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "1.5rem",
                gap: "1rem",
              }}
            >
              <button
                onClick={handleCerrarModalImprimir}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 24px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Salir
              </button>
              <button
                onClick={() => {
                  handleCerrarModalImprimir();
                  setMostrarTransacciones(true);
                  setMostrarMenu(false);
                  setMostrarOrdenes(false);
                }}
                style={{
                  background: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 24px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Ver Historial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de previsualización del PDF */}
      {showPdfPreview && ordenCobrada && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            overflow: "auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "800px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowPdfPreview(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <div
              style={{
                maxHeight: "calc(100vh - 250px)",
                overflow: "auto",
                background: "white",
              }}
            >
              <div ref={componentRef}>
                <ComprobanteContenido orden={ordenCobrada} />
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                onClick={() => setShowPdfPreview(false)}
                style={{
                  background: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
              <button
                onClick={handleGenerarPDF}
                style={{
                  background: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
            >
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

export default CajaDashboard;
