import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ReportesGerente = () => {
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [producto, setProducto] = useState('');
  const [cliente, setCliente] = useState('');
  const [productos, setProductos] = useState([]);
  const [reporteData, setReporteData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar lista de productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:3010/api/productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    };
    fetchProductos();
  }, []);

  const handleBuscar = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fecha_inicio', format(fechaInicio, 'yyyy-MM-dd'));
      if (fechaFin) params.append('fecha_fin', format(fechaFin, 'yyyy-MM-dd'));
      if (producto) params.append('producto', producto);
      if (cliente) params.append('cliente', cliente);

      const response = await fetch(`http://localhost:3010/api/reportes?${params.toString()}`);
      if (!response.ok) throw new Error('Error al obtener los datos');
      
      const data = await response.json();
      setReporteData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiar = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setProducto('');
    setCliente('');
    setReporteData([]);
    setError(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reportes de Pedidos
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Fecha Fin"
                value={fechaFin}
                onChange={setFechaFin}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                label="Producto"
              >
                <MenuItem value="">Todos</MenuItem>
                {productos.map((prod) => (
                  <MenuItem key={prod.id} value={prod.nombre}>
                    {prod.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} container justifyContent="flex-end" spacing={2}>
            <Grid item>
              <Button variant="outlined" onClick={handleLimpiar}>
                Limpiar
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={handleBuscar}>
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && reporteData.length === 0 && (
        <Alert severity="info">No se encontraron resultados</Alert>
      )}

      {!loading && !error && reporteData.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unitario</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reporteData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{format(new Date(row.fecha), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{row.cliente}</TableCell>
                  <TableCell>{row.producto}</TableCell>
                  <TableCell align="right">{row.cantidad}</TableCell>
                  <TableCell align="right">${row.precio_unitario.toFixed(2)}</TableCell>
                  <TableCell align="right">${row.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ReportesGerente; 