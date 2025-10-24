import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
//iconos
import {
  FaFilter,
  FaRedo,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaMoneyBillWave,
} from "react-icons/fa";

const DashboardGerente = () => {
  const [ventasPorProducto, setVentasPorProducto] = useState([]);
  const [ventasPorHora, setVentasPorHora] = useState([]);
  const [ingresosPorPeriodo, setIngresosPorPeriodo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("diario");

  const metaMensual = 5000;
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#00c49f",
    "#ffbb28",
    "#0088fe",
    "#ff8042",
    "#a28dd0",
    "#c6ff00",
  ];

  //Const Torta
  const [ingresosPorMetodoPago, setIngresosPorMetodoPago] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fechaInicio)
        params.append("fecha_inicio", format(fechaInicio, "yyyy-MM-dd"));
      if (fechaFin) params.append("fecha_fin", format(fechaFin, "yyyy-MM-dd"));
      params.append("periodo", periodoSeleccionado);

      const [resVentas, resHorarios, resIngresos, resMetodoPago] =
        await Promise.all([
          fetch(`http://localhost:3010/api/dashboard/ventas?${params}`),
          fetch(`http://localhost:3010/api/dashboard/horarios?${params}`),
          fetch(`http://localhost:3010/api/dashboard/ingresos?${params}`),
          fetch(
            `http://localhost:3010/api/dashboard/ingresos-metodo-pago?${params}`
          ),
        ]);

      if (!resVentas.ok || !resHorarios.ok || !resIngresos.ok) {
        throw new Error("Error al obtener los datos del servidor");
      }

      const [ventas, horarios, ingresos, metodoPago] = await Promise.all([
        resVentas.json(),
        resHorarios.json(),
        resIngresos.json(),
        resMetodoPago.json(),
      ]);

      setVentasPorProducto(
        ventas.map((v) => ({ nombre: v.label, cantidad: parseInt(v.value) }))
      );
      setVentasPorHora(
        horarios.map((h) => ({ hora: h.label, cantidad: parseInt(h.value) }))
      );
      setIngresosPorPeriodo(
        ingresos.map((i) => ({ periodo: i.label, total: parseFloat(i.value) }))
      );
      setIngresosPorMetodoPago(
        metodoPago.map((i) => ({
          nombre: i.label,
          valor: parseFloat(i.value),
        }))
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error al obtener los datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, periodoSeleccionado]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const resetFilters = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setPeriodoSeleccionado("diario");
  };

  const ingresosTotales = ingresosPorPeriodo.reduce(
    (acc, curr) => acc + curr.total,
    0
  );
  const porcentajeMeta = ((ingresosTotales / metaMensual) * 100).toFixed(0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard de Análisis de Ventas
      </Typography>

      {/* FILTROS */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
              <DatePicker
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={es}
            >
              <DatePicker
                label="Fecha Fin"
                value={fechaFin}
                onChange={setFechaFin}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodoSeleccionado}
                label="Período"
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              >
                <MenuItem value="diario">Diario</MenuItem>
                <MenuItem value="semanal">Semanal</MenuItem>
                <MenuItem value="mensual">Mensual</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ height: "56px" }}
              onClick={() => {
                resetFilters();
                fetchDashboardData();
              }}
              startIcon={<FaRedo />}
            >
              REINICIAR FILTROS
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* MÉTRICAS RESUMIDAS */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#f5f5f5" }}>
            <Typography
              variant="subtitle2"
              sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FaMoneyBillWave /> Ingresos Totales
            </Typography>

            <Typography variant="h4" color="primary">
              ${ingresosTotales.toFixed(2)}
            </Typography>
            <Typography variant="caption">
              Período: {periodoSeleccionado}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#f5f5f5" }}>
            <Typography variant="subtitle2">Meta Alcanzada</Typography>
            <Typography
              variant="h4"
              color={porcentajeMeta >= 100 ? "green" : "orange"}
            >
              {porcentajeMeta}%
            </Typography>
            <Typography variant="caption">
              Meta mensual: ${metaMensual}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#f5f5f5" }}>
            <Typography variant="subtitle2">Rango Seleccionado</Typography>
            <Typography variant="h6">
              {fechaInicio ? format(fechaInicio, "dd/MM/yyyy") : "Inicio"} -{" "}
              {fechaFin ? format(fechaFin, "dd/MM/yyyy") : "Fin"}
            </Typography>
            <Typography variant="caption">Actualizado</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* CONTENIDO */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={4}>
          {/* Ventas por Producto */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FaChartBar /> Ventas por Producto
              </Typography>
              <BarChart
                width={500}
                height={300}
                data={ventasPorProducto}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" />
                <Tooltip />
                <Legend
                  payload={[
                    {
                      value: "Cantidad Vendida",
                      type: "square",
                      color: "#4a90e2",
                    },
                  ]}
                />
                <Bar
                  dataKey="cantidad"
                  fill="#4a90e2"
                  name="Cantidad Vendida"
                />
              </BarChart>
            </Paper>
          </Grid>
          {/* Gráfico de Torta */}

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FaChartPie /> Ingresos por Método de Pago
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={ingresosPorMetodoPago}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {ingresosPorMetodoPago.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Paper>
          </Grid>
          {/* Ventas por Hora */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FaChartBar /> Ventas por Hora
              </Typography>
              <BarChart width={500} height={300} data={ventasPorHora}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend
                  payload={[
                    {
                      value: "Cantidad de Ventas",
                      type: "square",
                      color: "#7ed6df",
                    },
                  ]}
                />
                <Bar
                  dataKey="cantidad"
                  fill="#7ed6df"
                  name="Cantidad de Ventas"
                />
              </BarChart>
            </Paper>
          </Grid>
          {/* Ingresos por Período */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FaChartLine /> Ingresos por {periodoSeleccionado}
              </Typography>
              <AreaChart width={1000} height={300} data={ingresosPorPeriodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <defs>
                  <linearGradient id="ingresosGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0932b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f0932b" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#f0932b"
                  fill="url(#ingresosGrad)"
                  name="Ingresos ($)"
                />
                {periodoSeleccionado === "mensual" && (
                  <ReferenceLine
                    y={metaMensual}
                    label="Meta"
                    stroke="red"
                    strokeDasharray="3 3"
                  />
                )}
              </AreaChart>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default DashboardGerente;
