import PanelGerencia from './PanelGerencia';
import DashboardGerente from './DashboardGerente';
import ReportesGerente from './ReportesGerente';

const gerenteRoutes = [
  {
    path: '/gerente/dashboard',
    element: <DashboardGerente />
  },
  {
    path: '/gerente/reportes',
    element: <ReportesGerente />
  }
];

export default gerenteRoutes;
