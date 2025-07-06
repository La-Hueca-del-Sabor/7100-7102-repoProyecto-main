// ReportesGerente.jsx completo con filtros mejorados, íconos dentro de botones, imágenes uniformes y selects dinámicos para estado y método de pago

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Button,
  Paper,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  FaFilePdf,
  FaClipboardList,
  FaChartLine,
  FaUsers,
} from "react-icons/fa";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";

import imgPedidos from "../../../src/assets/pedidos.jpg";
import imgVentas from "../../../src/assets/ventas.jpg";
import imgUsuarios from "../../../src/assets/usuarios.jpg";

const ReportesGerente = () => {
  const [tipoReporte, setTipoReporte] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [estado, setEstado] = useState("");
  const [cliente, setCliente] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [productoId, setProductoId] = useState("");

  const [productos, setProductos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [metodosPago, setMetodosPago] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3010/api/productos")
      .then((res) => res.json())
      .then(setProductos);
    fetch("http://localhost:3011/api/estados")
      .then((res) => res.json())
      .then(setEstados);
    fetch("http://localhost:3011/api/metodos-pago")
      .then((res) => res.json())
      .then(setMetodosPago);
  }, []);

  const generarReporte = async (tipo) => {
    setTipoReporte(tipo);
    setLoading(true);
    setError(null);
    setData([]);

    const params = new URLSearchParams();
    if (fechaInicio)
      params.append("fecha_inicio", format(fechaInicio, "yyyy-MM-dd"));
    if (fechaFin) params.append("fecha_fin", format(fechaFin, "yyyy-MM-dd"));
    if (cliente) params.append("cliente", cliente);
    if (estado) params.append("estado", estado);
    if (metodoPago) params.append("metodo_pago", metodoPago);
    if (productoId) params.append("plato_id", productoId);

    try {
      const response = await fetch(
        `http://localhost:3011/api/reportes/${tipo}?${params.toString()}`
      );
      if (!response.ok) throw new Error("Error al generar el reporte");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    doc.text(
      `Reporte de ${
        tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)
      }`,
      14,
      20
    );
    const body = data.map((row) => {
      switch (tipoReporte) {
        case "pedidos":
          return [
            row.cliente_nombre,
            row.mesa,
            row.estado,
            row.hora_pedido,
            `$${Number(row.total).toFixed(2)}`,
            row.metodo_pago,
          ];
        case "ventas":
          return [
            row.plato,
            row.cantidad_total,
            `$${Number(row.total_generado).toFixed(2)}`,
          ];
        case "usuarios":
          return [
            row.cliente_nombre,
            row.total_pedidos,
            `$${Number(row.total_gastado).toFixed(2)}`,
            row.ultimo_pedido,
          ];
        default:
          return [];
      }
    });

    doc.autoTable({
      head: [[...Object.keys(body[0] || {})]],
      body,
    });

    doc.save(`reporte-${tipoReporte}.pdf`);
  };

  const renderReporte = () => {
    if (loading) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (data.length === 0)
      return <Alert severity="info">No hay datos para mostrar</Alert>;

    return (
      <Paper sx={{ p: 3, mt: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">
            Reporte de{" "}
            {tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}
          </Typography>
          <Button
            variant="outlined"
            color="success"
            startIcon={<FaFilePdf />}
            onClick={descargarPDF}
          >
            Descargar PDF
          </Button>
        </Box>
        {data.map((row, i) => (
          <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: "#f9f9f9" }}>
            {tipoReporte === "pedidos" && (
              <>
                <p>
                  <strong>Cliente:</strong> {row.cliente_nombre}
                </p>
                <p>
                  <strong>Mesa:</strong> {row.mesa}
                </p>
                <p>
                  <strong>Estado:</strong> {row.estado}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(row.hora_pedido).toLocaleString()}
                </p>
                <p>
                  <strong>Total:</strong> ${Number(row.total).toFixed(2)}
                </p>
                <p>
                  <strong>Método Pago:</strong> {row.metodo_pago}
                </p>
              </>
            )}
            {tipoReporte === "ventas" && (
              <>
                <p>
                  <strong>Plato:</strong> {row.plato}
                </p>
                <p>
                  <strong>Cantidad Vendida:</strong> {row.cantidad_total}
                </p>
                <p>
                  <strong>Total Generado:</strong> $
                  {Number(row.total_generado).toFixed(2)}
                </p>
              </>
            )}
            {tipoReporte === "usuarios" && (
              <>
                <p>
                  <strong>Cliente:</strong> {row.cliente_nombre}
                </p>
                <p>
                  <strong>Total Pedidos:</strong> {row.total_pedidos}
                </p>
                <p>
                  <strong>Total Gastado:</strong> $
                  {Number(row.total_gastado).toFixed(2)}
                </p>
                <p>
                  <strong>Último Pedido:</strong>{" "}
                  {new Date(row.ultimo_pedido).toLocaleString()}
                </p>
              </>
            )}
          </Paper>
        ))}
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reportes del Sistema
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Fila 1: Fechas y cliente */}
          <Grid item xs={12} md={4}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
              <DatePicker
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                renderInput={(p) => <TextField {...p} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
              <DatePicker
                label="Fecha Fin"
                value={fechaFin}
                onChange={setFechaFin}
                renderInput={(p) => <TextField {...p} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              fullWidth
            />
          </Grid>

          {/* Fila 2: Estado, Método de Pago, Producto */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Estado del Pedido</InputLabel>
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                label="Estado del Pedido"
              >
                <MenuItem value="">Todos</MenuItem>
                {estados.map((e) => (
                  <MenuItem key={e.id} value={e.label}>
                    {e.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                label="Método de Pago"
              >
                <MenuItem value="">Todos</MenuItem>
                {metodosPago.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select
                value={productoId}
                onChange={(e) => setProductoId(e.target.value)}
                label="Producto"
              >
                <MenuItem value="">Todos</MenuItem>
                {productos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <img
              src={imgPedidos}
              alt="Pedidos"
              width="100%"
              height={120}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <Typography variant="h6" mt={2}>
              Reporte de Pedidos
            </Typography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<FaClipboardList />}
              onClick={() => generarReporte("pedidos")}
            >
              Generar Reporte
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <img
              src={imgVentas}
              alt="Ventas"
              width="100%"
              height={120}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <Typography variant="h6" mt={2}>
              Reporte de Ventas
            </Typography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<FaChartLine />}
              onClick={() => generarReporte("ventas")}
            >
              Generar Reporte
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <img
              src={imgUsuarios}
              alt="Usuarios"
              width="100%"
              height={120}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />
            <Typography variant="h6" mt={2}>
              Reporte de Usuarios
            </Typography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<FaUsers />}
              onClick={() => generarReporte("usuarios")}
            >
              Generar Reporte
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Box>{renderReporte()}</Box>
    </Container>
  );
};

export default ReportesGerente;
