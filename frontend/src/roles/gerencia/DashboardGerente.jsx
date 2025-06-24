import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  ButtonGroup,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const DashboardGerente = () => {
  const [productosData, setProductosData] = useState([]);
  const [ingresosData, setIngresosData] = useState([]);
  const [horariosData, setHorariosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [periodoIngresos, setPeriodoIngresos] = useState('mensual');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fechaInicio) {
        params.append('fecha_inicio', format(fechaInicio, 'yyyy-MM-dd'));
      }
      if (fechaFin) {
        params.append('fecha_fin', format(fechaFin, 'yyyy-MM-dd'));
      }

      const [productosRes, ingresosRes, horariosRes] = await Promise.all([
        fetch(`http://localhost:3010/api/dashboard/ventas?${params}`),
        fetch(`http://localhost:3010/api/dashboard/ingresos?${params}&periodo=${periodoIngresos}`),
        fetch(`http://localhost:3010/api/dashboard/horarios?${params}`)
      ]);

      const productos = await productosRes.json();
      const ingresos = await ingresosRes.json();
      const horarios = await horariosRes.json();

      setProductosData(productos);
      setIngresosData(ingresos);
      setHorariosData(horarios);
    } catch (error) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fechaInicio, fechaFin, periodoIngresos]);

  const exportToPDF = (data, title) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Título
    pdf.setFontSize(16);
    pdf.text(title, pageWidth/2, 20, { align: 'center' });
    
    // Fechas del reporte si están establecidas
    pdf.setFontSize(10);
    let y = 30;
    if (fechaInicio || fechaFin) {
      if (fechaInicio) {
        pdf.text(`Desde: ${format(fechaInicio, 'dd/MM/yyyy')}`, 20, y);
      }
      if (fechaFin) {
        pdf.text(`Hasta: ${format(fechaFin, 'dd/MM/yyyy')}`, 20, y + 5);
      }
      y += 15;
    }
    
    // Datos
    pdf.setFontSize(12);
    data.forEach((item) => {
      const text = `${item.label}: ${item.value}`;
      pdf.text(text, 20, y);
      y += 10;
      
      if (y >= pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        y = 20;
      }
    });
    
    pdf.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  const exportToCSV = (data, title) => {
    const csvData = data.map(item => ({
      Categoría: item.label,
      Valor: item.value
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${title.toLowerCase().replace(/ /g, '_')}.csv`);
  };

  const handleDateChange = (date, isStart) => {
    if (isStart) {
      setFechaInicio(date);
    } else {
      setFechaFin(date);
    }
  };

  const handlePeriodoChange = (event) => {
    setPeriodoIngresos(event.target.value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1 }}>
          <Typography variant="body2">{label}</Typography>
          <Typography variant="body2" color="primary">
            {formatCurrency(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const DashboardCard = ({ title, data, isIngresos = false }) => (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        {isIngresos && (
          <FormControl size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodoIngresos}
              onChange={handlePeriodoChange}
              label="Período"
            >
              <MenuItem value="diario">Diario</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="mensual">Mensual</MenuItem>
            </Select>
          </FormControl>
        )}
        <ButtonGroup size="small">
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => exportToPDF(data, title)}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportToCSV(data, title)}
          >
            CSV
          </Button>
        </ButtonGroup>
      </Box>
      
      {data && data.length > 0 ? (
        <Box sx={{ flexGrow: 1, minHeight: 300, display: 'flex', justifyContent: 'center' }}>
          <BarChart
            width={600}
            height={300}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
            <YAxis
              tickFormatter={isIngresos ? formatCurrency : undefined}
            />
            <Tooltip content={isIngresos ? CustomTooltip : undefined} />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#8884d8" 
              name={isIngresos ? "Ingresos" : "Cantidad"}
            />
          </BarChart>
        </Box>
      ) : (
        <Alert severity="info">No hay datos disponibles</Alert>
      )}
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard Gerencial
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Fecha Inicio"
                value={fechaInicio}
                onChange={(date) => handleDateChange(date, true)}
                slotProps={{ textField: { fullWidth: true } }}
                maxDate={fechaFin || new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                label="Fecha Fin"
                value={fechaFin}
                onChange={(date) => handleDateChange(date, false)}
                slotProps={{ textField: { fullWidth: true } }}
                minDate={fechaInicio}
                maxDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                onClick={() => {
                  setFechaInicio(null);
                  setFechaFin(null);
                }}
                fullWidth
              >
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </LocalizationProvider>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <DashboardCard
            title="Productos Más Vendidos"
            data={productosData}
          />
        </Grid>
        
        <Grid item xs={12}>
          <DashboardCard
            title="Ingresos"
            data={ingresosData}
            isIngresos={true}
          />
        </Grid>
        
        <Grid item xs={12}>
          <DashboardCard
            title="Distribución de Pedidos por Hora"
            data={horariosData}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardGerente; 